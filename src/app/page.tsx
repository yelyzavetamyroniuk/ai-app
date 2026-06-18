import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <main className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
        AI-powered app
      </h1>
      <p className="mt-4 max-w-xl text-lg text-gray-500">
        Built with Next.js, deployed on Vercel. AI calls stay server-side — your keys are never exposed.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/sign-in">
          <Button>Get started</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="secondary">Dashboard</Button>
        </Link>
      </div>
    </main>
  );
}
