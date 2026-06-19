import Link from "next/link";
import { auth } from "@/lib/auth";
import { signOut } from "@/lib/auth";

const vt = { fontFamily: "var(--font-vt323), 'Courier New', monospace" };

export async function Navbar() {
  const session = await auth();

  return (
    <nav style={{ backgroundColor: "#FFF8DC", borderBottom: "4px solid #2C3E50", boxShadow: "0 4px 0px #2C3E50" }}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="font-pixel" style={{ color: "#E74C3C", fontSize: "11px" }}>
            WDR
          </span>
          <span className="hidden sm:block font-pixel" style={{ fontSize: "8px", color: "#2C3E50" }}>
            WORK DAMAGE REPORT
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <Link href="/dashboard" className="pixel-btn" style={{ fontSize: "9px", padding: "6px 14px" }}>
                DASHBOARD
              </Link>
              <span className="hidden sm:block" style={{ ...vt, fontSize: "18px", color: "#555" }}>
                {session.user.email}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit" className="pixel-btn" style={{ fontSize: "9px", padding: "6px 14px" }}>
                  ВИЙТИ
                </button>
              </form>
            </>
          ) : (
            <Link href="/sign-in" className="pixel-btn pixel-btn-cta" style={{ fontSize: "10px", padding: "8px 20px" }}>
              START
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
