import { SignInButtons } from "@/components/auth/SignInButtons";

export default function SignInPage() {
  return (
    <main className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-4">
      <div
        className="w-full max-w-sm space-y-6 rounded-2xl p-8 card-glow"
        style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <div className="text-center space-y-2">
          <div className="text-4xl mb-4">📉</div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
            Work Damage Report
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Увійди, щоб відстежувати свій робочий стан
          </p>
        </div>
        <SignInButtons />
      </div>
    </main>
  );
}
