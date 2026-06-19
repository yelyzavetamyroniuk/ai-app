import { SignInButtons } from "@/components/auth/SignInButtons";

export default function SignInPage() {
  return (
    <main
      className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-4"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="w-full max-w-sm space-y-6 pixel-card">
        <div className="text-center space-y-3">
          <p
            className="font-pixel"
            style={{ color: "var(--accent)", fontSize: "10px" }}
          >
            *** PLAYER LOGIN ***
          </p>
          <p
            style={{
              fontFamily: "var(--font-vt323), 'Courier New', monospace",
              fontSize: "22px",
              color: "var(--text)",
            }}
          >
            Insert coin to track your work day
          </p>
          <p
            style={{
              fontFamily: "var(--font-vt323), 'Courier New', monospace",
              fontSize: "17px",
              color: "var(--text-muted)",
            }}
          >
            Sign in with GitHub to continue
          </p>
        </div>
        <SignInButtons />
        <p
          className="text-center"
          style={{
            fontFamily: "var(--font-vt323), 'Courier New', monospace",
            fontSize: "16px",
            color: "var(--text-dim)",
          }}
        >
          © 2025 WORK DAMAGE REPORT v1.0
        </p>
      </div>
    </main>
  );
}
