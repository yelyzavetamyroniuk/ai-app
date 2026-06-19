import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Navbar } from "@/components/ui/Navbar";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Work Damage Report",
  description: "Щоденний звіт про вплив робочого дня на твою енергію та фокус.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
