import { auth } from "@/lib/auth";
import { anthropic } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { WDRAnalysis } from "@/types";

const bodySchema = z.object({
  mood: z.number().int().min(0).max(4),
  sleepHours: z.number().min(0).max(12),
  meetings: z.number().int().min(0).max(10),
  workHours: z.number().min(0).max(16),
  distractions: z.number().int().min(0).max(10),
  stressLevel: z.string().min(1).max(50),
  annoyances: z.array(z.string()).max(10),
  comment: z.string().max(500).optional(),
});

const MOOD_LABELS = ["Жахливо", "Погано", "Нормально", "Добре", "Відмінно"];
const DISTRACTION_LABELS = [
  "Не відволікали",
  "Раз або два",
  "Кілька разів",
  "Досить часто",
  "Постійно",
  "Дуже часто",
  "Складно рахувати",
  "Майже без перерв",
  "Хаос",
  "Не дали навіть пообідати",
  "Не дали навіть пообідати",
];

const SYSTEM_PROMPT = `Ти Work Damage Report AI. Аналізуєш робочий день і даєш ПРОСТІ КОНКРЕТНІ рекомендації.

ЗАБОРОНЕНО: довгі заплутані метафори, складні конструкції, книжкові формулювання, мотиваційний пафос.
ПОТРІБНО: короткі прямі поради. Як друг говорить.

Приклади ХОРОШИХ рекомендацій:
- "Завтра поїж нормально на обід — 30 хвилин з телефоном в режимі польоту"
- "Закрий ноут о 19:00. Все, робочий день закінчився"
- "Запиши в календар обідню перерву і не пропускай її"
- "Скажи менеджеру що в тебе 5 задач — нехай допоможе з пріоритетами"

Тон: дружній, легкий гумор, без пафосу і без "мотиваційних" фраз.

Culprit ("Мем дня") — коротка іронічна фраза в ігровому форматі. Приклади стилю:
- "[CRITICAL DAMAGE] Повідомлення 'є хвилинка?' завдало критичного урону."
- "[BOSS FIGHT] Сьогодні дедлайн переміг з рахунком 3:1."
- "[SIDE QUEST] Задача на 5 хвилин прожила з тобою весь день."
- "[WARNING] Пріоритет №1 змінився 4 рази до обіду."
- "[MISSION FAILED] План 'спокійно попрацювати' завершився о 09:17."
- "[CHECKPOINT] Обідня перерва успішно пропущена."
- "[ERROR 404] Концентрацію не знайдено."
- "[FINAL BOSS] Остання зустріч дня раптом перестала бути останньою."
- "[RESPAWN TOMORROW] Сьогоднішню версію себе можна закривати."
- "[ACHIEVEMENT UNLOCKED] Пережито 7 зустрічей поспіль."
- "[ENERGY: 12%] Кава більше не вирішує цю проблему."
- "[VICTORY] Ти вижив. Статистика уточнюється."
- "[PATCH NOTES] Виправлено 3 баги. Додано 5 нових."
- "[COMBO x12] Тебе відволікали частіше, ніж ти встигав повернутися до роботи."

ЗАБОРОНЕНО використовувати emoji у відповідях. Тільки текст. Жодних символів типу смайлів.

Відповідай ВИКЛЮЧНО валідним JSON без жодного тексту поза межами JSON.

Формат відповіді:
{
  "factors": [
    { "name": "string", "percentage": number }
  ],
  "damageScore": number,
  "mainFactor": "string",
  "culprit": "string",
  "recommendations": ["string", "string", "string"],
  "actionType": "focus" | "priority" | "recovery" | "boundaries",
  "slackMessage": "string"
}

Правила:
- damageScore від 0 до 100
- factors: 3-5 факторів
- culprit — мем дня в ігровому форматі, одне речення, без лапок всередині
- recommendations — три конкретні короткі дії, українською, прямо і просто
- slackMessage — готовий текст для Slack/Teams на основі actionType та реальних даних
- actionType: focus (проблема з концентрацією), priority (забагато задач), recovery (перевтома), boundaries (надмірна комунікація)`;

function extractJSON(text: string): string {
  const codeBlock = text.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
  if (codeBlock) return codeBlock[1];
  const jsonObj = text.match(/\{[\s\S]*\}/);
  if (jsonObj) return jsonObj[0];
  return text;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response("Invalid request body", { status: 400 });
  }

  const data = parsed.data;
  const moodLabel = MOOD_LABELS[data.mood] ?? "Невідомо";
  const distractionsLabel = DISTRACTION_LABELS[Math.min(data.distractions, 10)] ?? "Часто";

  const userMessage = `Ось дані про мій робочий день:

🙂 Настрій: ${moodLabel}
😴 Сон: ${data.sleepHours} год.
📅 Зустрічей: ${data.meetings}
⏰ Годин роботи: ${data.workHours}
🔔 Відволікань: ${distractionsLabel} (${data.distractions}/10)
😤 Рівень стресу: ${data.stressLevel}
⚡ Що вплинуло: ${data.annoyances.length > 0 ? data.annoyances.join(", ") : "нічого конкретного"}
${data.comment ? `💬 Коментар: ${data.comment}` : ""}

Проаналізуй мій день та надай Work Damage Report у форматі JSON.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const rawText = message.content[0].type === "text" ? message.content[0].text : "";
  let analysis: WDRAnalysis;

  try {
    analysis = JSON.parse(extractJSON(rawText)) as WDRAnalysis;
  } catch {
    return new Response("AI returned invalid JSON", { status: 502 });
  }

  const entry = await prisma.moodEntry.create({
    data: {
      userId: session.user.id,
      mood: data.mood,
      sleepHours: data.sleepHours,
      meetings: data.meetings,
      workHours: data.workHours,
      distractions: data.distractions,
      stressLevel: data.stressLevel,
      annoyances: data.annoyances,
      comment: data.comment ?? null,
      culprit: analysis.culprit,
      damageScore: analysis.damageScore,
      aiAnalysis: analysis as object,
    },
  });

  return Response.json({ id: entry.id, analysis });
}
