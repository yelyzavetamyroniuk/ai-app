import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import { Navbar } from "@/components/ui/Navbar";
import "./globals.css";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
});

export const metadata: Metadata = {
  title: "Work Damage Report",
  description: "Daily report on how work impacts your energy and focus.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={`${pressStart2P.variable} ${vt323.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
