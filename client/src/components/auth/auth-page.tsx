import { SupabaseAuth } from './supabase-auth';

export function AuthPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="/attached_assets/Lo_1754348262426.png" 
            alt="Orchestra by PulseSpark.ai" 
            className="mx-auto mb-4 h-16 w-auto"
          />
        </div>

        <SupabaseAuth />
      </div>
    </div>
  );
}