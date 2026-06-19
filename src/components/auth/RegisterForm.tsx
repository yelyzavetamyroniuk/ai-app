"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      let errorCode = "REGISTRATION_FAILED";
      try {
        const data = await res.json();
        errorCode = data.error ?? errorCode;
      } catch {}
      setError(errorCode === "EMAIL_TAKEN" ? "EMAIL ALREADY REGISTERED" : "REGISTRATION FAILED");
      setIsLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      setError("AUTO-LOGIN FAILED — GO TO SIGN IN");
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PixelField label="NAME" type="text" value={form.name}
        onChange={(v) => setForm((p) => ({ ...p, name: v }))} placeholder="Your name" />
      <PixelField label="EMAIL" type="email" value={form.email}
        onChange={(v) => setForm((p) => ({ ...p, email: v }))} placeholder="you@example.com" />
      <PixelField label="PASSWORD" type="password" value={form.password}
        onChange={(v) => setForm((p) => ({ ...p, password: v }))} placeholder="Min 6 chars" />

      {error && (
        <div className="pixel-card" style={{ border: "3px solid #c0392b", background: "#fde8e8", padding: "10px 14px" }}>
          <p className="font-pixel" style={{ fontSize: "8px", color: "#c0392b" }}>{error}</p>
        </div>
      )}

      <button type="submit" disabled={isLoading}
        className="pixel-btn pixel-btn-cta w-full"
        style={{ fontSize: "10px", padding: "16px", minHeight: "52px" }}>
        {isLoading ? <span className="blink">█ CREATING ACCOUNT...</span> : "▶ REGISTER"}
      </button>
    </form>
  );
}

function PixelField({ label, type, value, onChange, placeholder }: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div className="space-y-1">
      <label className="font-pixel" style={{ fontSize: "8px", color: "#333", display: "block" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="pixel-input font-pixel"
        style={{ fontSize: "10px" }}
      />
    </div>
  );
}
