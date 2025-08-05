import { SupabaseAuth } from './supabase-auth';
import orchestraLogo from '@assets/Lo_1754349496969.png';

export function AuthPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        <SupabaseAuth />
      </div>
    </div>
  );
}