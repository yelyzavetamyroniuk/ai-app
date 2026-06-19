import Link from "next/link";
import { auth } from "@/lib/auth";
import { CheckinForm } from "@/components/wdr/CheckinForm";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) return <LandingHero />;

  return (
    <main style={{ minHeight: "calc(100vh - 56px)" }}>
      <div className="mx-auto w-full max-w-2xl px-4 py-8 pb-16">
        <div className="mb-8 text-center space-y-2">
          <h1
            className="font-pixel"
            style={{ color: "#E74C3C", fontSize: "15px", lineHeight: 2, letterSpacing: "0.03em" }}
          >
            WORK DAMAGE REPORT
          </h1>
          <p className="font-pixel" style={{ fontSize: "9px", lineHeight: 2, color: "var(--text-muted)" }}>
            Daily report — how bad was today?
          </p>
        </div>
        <CheckinForm />
      </div>
    </main>
  );
}

function PixelCloud({ top, duration, delay }: { top: string; duration: string; delay: string }) {
  return (
    <div style={{ position: "absolute", top, left: 0, pointerEvents: "none", animation: `floatCloud ${duration} linear ${delay} infinite` }}>
      <div style={{ marginLeft: "20px", width: "36px", height: "10px", background: "rgba(255,255,255,0.93)" }} />
      <div style={{ width: "70px", height: "14px", background: "rgba(255,255,255,0.93)" }} />
      <div style={{ marginLeft: "10px", width: "50px", height: "10px", background: "rgba(255,255,255,0.93)" }} />
    </div>
  );
}

function PixelBird({ top, duration, delay }: { top: string; duration: string; delay: string }) {
  return (
    <div style={{ position: "absolute", top, left: 0, pointerEvents: "none", animation: `flyBird ${duration} linear ${delay} infinite` }}>
      <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
        <path d="M 0 9 Q 7 1 14 9 Q 21 1 28 9" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function PixelFlowers() {
  const flowers = [
    { left: "4%",  color: "#E74C3C" },
    { left: "10%", color: "#F39C12" },
    { left: "18%", color: "#E74C3C" },
    { left: "30%", color: "#F39C12" },
    { left: "44%", color: "#E74C3C" },
    { left: "58%", color: "#F39C12" },
    { left: "70%", color: "#E74C3C" },
    { left: "82%", color: "#F39C12" },
    { left: "92%", color: "#E74C3C" },
  ];
  return (
    <>
      {flowers.map((f, i) => (
        <div key={i} style={{ position: "absolute", bottom: "22px", left: f.left, display: "flex", flexDirection: "column", alignItems: "center", gap: "1px", zIndex: 1, pointerEvents: "none" }}>
          <div style={{ width: "8px", height: "8px", background: f.color, border: "1px solid #1a1a1a" }} />
          <div style={{ width: "2px", height: "12px", background: "#27AE60" }} />
        </div>
      ))}
    </>
  );
}

function LandingHero() {
  return (
    <main
      className="flex flex-col items-center justify-center px-4 py-16"
      style={{
        background: "linear-gradient(to bottom, #87CEEB 0%, #98D8E8 55%, #B4E7CE 100%)",
        minHeight: "calc(100vh - 56px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <PixelCloud top="6%"  duration="28s" delay="0s" />
      <PixelCloud top="13%" duration="40s" delay="10s" />
      <PixelCloud top="4%"  duration="35s" delay="20s" />

      <PixelBird top="10%" duration="8s"  delay="0s" />
      <PixelBird top="16%" duration="12s" delay="2s" />
      <PixelBird top="7%"  duration="10s" delay="5s" />
      <PixelBird top="22%" duration="9s"  delay="1s" />
      <PixelBird top="5%"  duration="14s" delay="7s" />
      <PixelBird top="19%" duration="11s" delay="4s" />

      <div className="w-full max-w-xl space-y-6" style={{ position: "relative", zIndex: 3 }}>
        <div className="pixel-card text-center space-y-4" style={{ border: "4px solid #E74C3C", boxShadow: "6px 6px 0px #1a1a1a" }}>
          <h1
            className="font-pixel"
            style={{ color: "#E74C3C", fontSize: "14px", lineHeight: 2, letterSpacing: "0.05em" }}
          >
            WORK DAMAGE REPORT
          </h1>
          <p
            className="font-pixel"
            style={{ fontSize: "9px", lineHeight: 2.2, color: "#1a1a1a" }}
          >
            Більшість людей знають, що день був важким — але не можуть швидко визначити чому
          </p>
          <p className="font-pixel blink" style={{ color: "#E74C3C", fontSize: "9px" }}>
            INSERT COIN TO START
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/sign-in"
            className="pixel-btn pixel-btn-cta text-center"
            style={{ fontSize: "13px", padding: "18px 32px", minHeight: "60px", minWidth: "280px" }}
          >
            PRESS START
          </Link>
          <Link
            href="/register"
            className="pixel-btn text-center"
            style={{ fontSize: "10px", padding: "18px 32px", minHeight: "60px", minWidth: "280px" }}
          >
            NEW PLAYER
          </Link>
        </div>
      </div>

      <PixelFlowers />

      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "40px",
        background: "linear-gradient(to bottom, #5b8c2a 0%, #5b8c2a 30%, #8b6914 30%, #8b6914 100%)",
        borderTop: "3px solid #3d6b1a",
        zIndex: 0,
      }} />
    </main>
  );
}
