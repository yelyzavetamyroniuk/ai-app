import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main
      className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-4"
      style={{ background: "linear-gradient(to bottom, #4a6fa5 0%, #7b9ec4 100%)" }}
    >
      <div className="w-full max-w-sm space-y-6 pixel-card" style={{ border: "3px solid #c0392b" }}>
        <div className="text-center space-y-3">
          <h1 className="font-pixel" style={{ color: "#c0392b", fontSize: "12px", lineHeight: 2 }}>
            NEW PLAYER
          </h1>
          <p className="font-pixel" style={{ fontSize: "9px", color: "#555", lineHeight: 2 }}>
            Create your account
          </p>
        </div>
        <RegisterForm />
        <p className="font-pixel text-center" style={{ fontSize: "8px", color: "#777" }}>
          Already have account?{" "}
          <a href="/sign-in" style={{ color: "#2c3e7a", textDecoration: "underline" }}>
            SIGN IN
          </a>
        </p>
      </div>
    </main>
  );
}
