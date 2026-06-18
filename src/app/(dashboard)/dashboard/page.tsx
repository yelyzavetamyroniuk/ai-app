import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Chat } from "@/components/ai/Chat";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Hello, {session.user.name ?? session.user.email}
        </p>
      </div>
      <Chat />
    </main>
  );
}
