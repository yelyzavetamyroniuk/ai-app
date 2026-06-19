import Link from "next/link";
import { auth } from "@/lib/auth";
import { signOut } from "@/lib/auth";

export async function Navbar() {
  const session = await auth();

  return (
    <nav
      style={{
        borderBottom: "1px solid var(--border)",
        backgroundColor: "rgba(8, 8, 13, 0.85)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl">📉</span>
          <span
            className="text-sm font-bold tracking-tight"
            style={{ color: "var(--accent-2)" }}
          >
            WDR
          </span>
          <span
            className="hidden sm:block text-xs font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            Work Damage Report
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm transition-colors hover:opacity-100"
                style={{ color: "var(--text-muted)" }}
              >
                Dashboard
              </Link>
              <span className="text-xs hidden sm:block" style={{ color: "var(--text-dim)" }}>
                {session.user.email}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{
                    color: "var(--text-muted)",
                    border: "1px solid var(--border)",
                    backgroundColor: "transparent",
                  }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-accent)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text)";
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
                  }}
                >
                  Вийти
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/sign-in"
              className="text-sm px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: "var(--accent)",
                color: "white",
              }}
            >
              Увійти
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
