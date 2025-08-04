import { SupabaseAuth } from './supabase-auth';

export function AuthPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Orchestra
          </h1>
          <p className="text-muted-foreground">
            by PulseSpark.ai
          </p>
        </div>

        <SupabaseAuth />
      </div>
    </div>
  );
}