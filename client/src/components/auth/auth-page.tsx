import { SupabaseAuth } from './supabase-auth';
import orchestraLogo from '@assets/Lo_1754349496969.png';

export function AuthPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        {/* Logo with white background circle and glow */}
        <div className="flex justify-center mb-8">
          <div className="w-44 h-44 rounded-full bg-white flex items-center justify-center"
               style={{
                 boxShadow: '0 4px 20px rgba(61, 23, 0, 0.1), 0 0 40px rgba(228, 228, 228, 0.1)'
               }}>
            <img 
              src={orchestraLogo}
              alt="Orchestra by PulseSpark.ai" 
              className="w-44 h-44 object-contain"
            />
          </div>
        </div>

        <SupabaseAuth />
      </div>
    </div>
  );
}