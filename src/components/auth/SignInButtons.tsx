"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const vt = { fontFamily: "var(--font-vt323), 'Courier New', monospace" };

export function SignInButtons() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      setError("INVALID EMAIL OR PASSWORD");
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleCredentials} className="space-y-3">
        <div className="space-y-1">
          <label className="font-pixel" style={{ fontSize: "8px", color: "#333", display: "block" }}>EMAIL</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="you@example.com"
            required
            className="pixel-input"
          />
        </div>
        <div className="space-y-1">
          <label className="font-pixel" style={{ fontSize: "8px", color: "#333", display: "block" }}>PASSWORD</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            placeholder="••••••••"
            required
            className="pixel-input"
          />
        </div>

        {error && (
          <div style={{ border: "3px solid #E74C3C", background: "#FFF8DC", padding: "10px 14px" }}>
            <p className="font-pixel" style={{ fontSize: "9px", color: "#E74C3C" }}>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="pixel-btn pixel-btn-cta w-full"
          style={{ fontSize: "11px", padding: "16px", minHeight: "52px" }}
        >
          {isLoading ? <span className="blink">█ LOGGING IN...</span> : "▶ SIGN IN"}
        </button>
      </form>

      <p className="font-pixel text-center" style={{ fontSize: "8px", color: "#666" }}>
        No account?{" "}
        <a href="/register" style={{ color: "#2c3e7a", textDecoration: "underline" }}>REGISTER HERE</a>
      </p>
    </div>
  );
}
