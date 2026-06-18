import { SignInButtons } from "@/components/auth/SignInButtons";

export default function SignInPage() {
  return (
    <main className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to access your AI assistant</p>
        </div>
        <SignInButtons />
      </div>
    </main>
  );
}
