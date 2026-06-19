import Link from "next/link";
import { auth } from "@/lib/auth";
import { signOut } from "@/lib/auth";

export async function Navbar() {
  const session = await auth();

  return (
    <nav
      style={{
        backgroundColor: "#0f3460",
        borderBottom: "3px solid #e94560",
        boxShadow: "0 4px 0px #000",
      }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <span
            className="font-pixel text-xs tracking-tight"
            style={{ color: "#e94560", fontSize: "11px" }}
          >
            WDR
          </span>
          <span
            style={{
              color: "#aaa",
              fontFamily: "var(--font-vt323), 'Courier New', monospace",
              fontSize: "16px",
            }}
            className="hidden sm:block"
          >
            WORK DAMAGE REPORT
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="pixel-btn"
                style={{ fontSize: "8px", padding: "6px 12px" }}
              >
                DASHBOARD
              </Link>
              <span
                className="hidden sm:block"
                style={{
                  color: "var(--text-dim)",
                  fontFamily: "var(--font-vt323), 'Courier New', monospace",
                  fontSize: "16px",
                }}
              >
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
                  className="pixel-btn"
                  style={{ fontSize: "8px", padding: "6px 12px", color: "var(--text-muted)" }}
                >
                  EXIT
                </button>
              </form>
            </>
          ) : (
            <Link href="/sign-in" className="pixel-btn pixel-btn-primary" style={{ fontSize: "8px" }}>
              START
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
