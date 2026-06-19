import { auth } from "@/lib/auth";
import { anthropic } from "@/lib/anthropic";
import { z } from "zod";

const bodySchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1).max(2000),
  })).min(1).max(30),
  context: z.object({
    damageScore: z.number(),
    mainFactor: z.string(),
    culprit: z.string(),
    recommendations: z.array(z.string()),
    actionType: z.string(),
    factors: z.array(z.object({ name: z.string(), percentage: z.number() })),
  }),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  const { messages, context } = parsed.data;

  const systemPrompt = `Ти WDR AI — дружній співрозмовник, який знає сьогоднішній Damage Report користувача. Допомагаєш розібратись зі стресом, даєш конкретні поради. Тон: як друг. Без пафосу. Українською. Короткі відповіді 2-4 речення. ЗАБОРОНЕНО використовувати emoji у відповідях. Тільки текст. Жодних символів типу смайлів.

Сьогоднішній Damage Report:
- Damage Score: ${context.damageScore}/100
- Головний фактор: ${context.mainFactor}
- Мем дня: ${context.culprit}
- Рекомендації: ${context.recommendations.join("; ")}
- Тип дії: ${context.actionType}
- Фактори: ${context.factors.map((f) => `${f.name} (${f.percentage}%)`).join(", ")}`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const content =
    message.content[0].type === "text"
      ? message.content[0].text
      : "Вибач, не зрозумів. Спробуй ще раз.";

  return Response.json({ content });
}
