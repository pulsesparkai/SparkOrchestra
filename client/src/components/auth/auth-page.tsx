import { SupabaseAuth } from './supabase-auth';
import orchestraLogo from '@assets/Lo_1754349496969.png';

export function AuthPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        {/* Logo positioned to overlay the auth card */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -top-24 z-10">
          <div className="w-48 h-48 md:w-48 md:h-48 sm:w-36 sm:h-36 rounded-full flex items-center justify-center"
               style={{
                 background: 'rgba(255,255,255,0.1)',
                 boxShadow: '0 8px 32px rgba(107, 70, 193, 0.2)'
               }}>
            <img 
              src={orchestraLogo}
              alt="Orchestra by PulseSpark.ai" 
              className="w-48 h-48 md:w-48 md:h-48 sm:w-36 sm:h-36 object-contain"
            />
          </div>
        </div>

        {/* Auth card with top margin to accommodate logo */}
        <div className="mt-24">
          <SupabaseAuth />
        </div>
      </div>
    </div>
  );
}