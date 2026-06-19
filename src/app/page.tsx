import Link from "next/link";
import { auth } from "@/lib/auth";
import { CheckinForm } from "@/components/wdr/CheckinForm";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    return <LandingHero />;
  }

  return (
    <main
      className="mx-auto w-full max-w-2xl px-4 py-8 pb-16"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="mb-8 text-center space-y-3">
        <p
          className="font-pixel"
          style={{ color: "var(--accent)", fontSize: "10px" }}
        >
          *** DAILY CHECKIN ***
        </p>
        <h1
          className="font-pixel"
          style={{ color: "var(--text)", fontSize: "13px", lineHeight: "2" }}
        >
          WORK DAMAGE REPORT
        </h1>
        <p
          style={{
            fontFamily: "var(--font-vt323), 'Courier New', monospace",
            fontSize: "20px",
            color: "var(--text-muted)",
          }}
        >
          Щоденний звіт про вплив робочого дня на твою енергію та фокус.
        </p>
      </div>
      <CheckinForm />
    </main>
  );
}

function LandingHero() {
  return (
    <main
      className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-4 py-12 text-center"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="max-w-xl space-y-8">
        {/* Arcade header */}
        <div className="pixel-card" style={{ border: "3px solid var(--accent)" }}>
          <p
            className="font-pixel"
            style={{ color: "var(--accent)", fontSize: "10px", marginBottom: "12px" }}
          >
            ▶ WORK DAMAGE REPORT ◀
          </p>
          <p
            className="font-pixel"
            style={{ color: "var(--text)", fontSize: "8px", lineHeight: "2.5" }}
          >
            TRACK YOUR DAILY WORK DAMAGE
          </p>
          <p
            className="font-pixel blink mt-4"
            style={{ color: "var(--yellow)", fontSize: "8px" }}
          >
            INSERT COIN TO START
          </p>
        </div>

        {/* Feature list */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {[
            { key: "AI SCAN", text: "Знаходить приховані джерела навантаження" },
            { key: "DAMAGE SCORE", text: "Одна цифра замість туману у голові" },
            { key: "ACTION ITEM", text: "Конкретна дія, а не загальні поради" },
          ].map((f) => (
            <div key={f.key} className="pixel-card">
              <p
                className="font-pixel mb-2"
                style={{ color: "var(--accent)", fontSize: "8px" }}
              >
                &gt; {f.key}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-vt323), 'Courier New', monospace",
                  fontSize: "18px",
                  color: "var(--text-muted)",
                }}
              >
                {f.text}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/sign-in" className="pixel-btn pixel-btn-primary" style={{ fontSize: "10px", padding: "16px 32px" }}>
            ▶ START GAME
          </Link>
          <Link href="/sign-in" className="pixel-btn" style={{ fontSize: "8px" }}>
            HIGH SCORES
          </Link>
        </div>

        <p
          style={{
            fontFamily: "var(--font-vt323), 'Courier New', monospace",
            fontSize: "16px",
            color: "var(--text-dim)",
          }}
        >
          © 2025 WDR STUDIOS · 1 PLAYER
        </p>
      </div>
    </main>
  );
}
