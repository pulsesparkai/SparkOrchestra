import { SupabaseAuth } from './supabase-auth';

export function AuthPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Orchestra
          </h1>
          <p className="text-gray-400">
            by PulseSpark.ai
          </p>
        </div>

        <SupabaseAuth />
      </div>
    </div>
  );
}