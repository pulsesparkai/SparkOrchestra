import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';

export function AuthCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle magic link callback from URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          // Set the session from the magic link tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('Auth callback error:', error);
            setLocation('/');
            return;
          }
          
          if (data.session) {
            // Clear the hash from URL
            window.history.replaceState({}, document.title, window.location.pathname);
            // Successfully authenticated, redirect to dashboard
            setLocation('/dashboard');
            return;
          }
        }
        
        // Fallback: check for existing session
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Auth callback error:', error);
          setLocation('/');
          return;
        }

        if (data.session) {
          // Successfully authenticated, redirect to dashboard
          setLocation('/dashboard');
        } else {
          // No session, redirect to home
          setLocation('/');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setLocation('/');
      }
    };

    handleAuthCallback();
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Completing sign in...</p>
      </div>
    </div>
  );
}