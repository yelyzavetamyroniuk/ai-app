import Link from "next/link";
import { auth } from "@/lib/auth";
import { CheckinForm } from "@/components/wdr/CheckinForm";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    return <LandingHero />;
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 pb-16">
      <div className="mb-8 text-center">
        <h1
          className="text-3xl sm:text-4xl font-black tracking-tight mb-2"
          style={{ color: "var(--text)" }}
        >
          Work Damage Report
        </h1>
        <p className="text-base" style={{ color: "var(--text-muted)" }}>
          Щоденний звіт про вплив робочого дня на твою енергію та фокус.
        </p>
      </div>
      <CheckinForm />
    </main>
  );
}

function LandingHero() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-4 py-16 text-center">
      <div className="max-w-2xl space-y-8">
        {/* Badge */}
        <div className="flex justify-center">
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase"
            style={{
              backgroundColor: "var(--accent-glow)",
              border: "1px solid var(--border-accent)",
              color: "var(--accent-2)",
            }}
          >
            📉 Work Damage Report
          </span>
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1
            className="text-5xl sm:text-6xl font-black tracking-tight leading-tight"
            style={{ color: "var(--text)" }}
          >
            Твій день{" "}
            <span
              style={{
                background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              вплинув
            </span>{" "}
            на тебе
          </h1>
          <p className="text-lg sm:text-xl max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
            Більшість людей знають, що день був важким — але не можуть швидко визначити чому.
            WDR аналізує твій день і пропонує конкретну дію.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {[
            { emoji: "🔍", title: "AI-аналіз", text: "Знаходить приховані джерела навантаження" },
            { emoji: "📊", title: "Damage Score", text: "Одна цифра замість туману у голові" },
            { emoji: "⚡", title: "Готове рішення", text: "Конкретна дія, а не загальні поради" },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl p-5 card-glow"
              style={{ backgroundColor: "var(--bg-card)" }}
            >
              <div className="text-2xl mb-2">{f.emoji}</div>
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>
                {f.title}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {f.text}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href="/sign-in"
            className="px-8 py-4 rounded-2xl text-base font-semibold transition-all"
            style={{
              backgroundColor: "var(--accent)",
              color: "white",
              boxShadow: "0 0 32px rgba(124,106,255,0.3)",
            }}
          >
            🔍 Почати чекін
          </Link>
          <Link
            href="/sign-in"
            className="px-6 py-4 rounded-2xl text-sm font-medium transition-all"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}
          >
            Увійти через GitHub →
          </Link>
        </div>

        <p className="text-xs" style={{ color: "var(--text-dim)" }}>
          Не позиціонуємо як боротьбу з роботою — це інструмент для усвідомленої роботи 🧘
        </p>
      </div>
    </main>
  );
}
