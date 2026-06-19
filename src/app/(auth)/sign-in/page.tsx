import { SignInButtons } from "@/components/auth/SignInButtons";

export default function SignInPage() {
  return (
    <main
      className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-4"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="w-full max-w-sm space-y-6 pixel-card" style={{ border: "3px solid #c0392b" }}>
        <div className="text-center space-y-3">
          <h1 className="font-pixel" style={{ color: "#c0392b", fontSize: "11px", lineHeight: 2 }}>
            PLAYER LOGIN
          </h1>
          <p className="font-pixel" style={{ fontSize: "9px", color: "#555", lineHeight: 2 }}>
            Sign in to track your work damage
          </p>
        </div>
        <SignInButtons />
        <p className="font-pixel text-center" style={{ fontSize: "8px", color: "var(--text-dim)" }}>
          Work Damage Report © 2025
        </p>
      </div>
    </main>
  );
}
