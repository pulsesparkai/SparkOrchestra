import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';

export function AuthCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Parse both hash (magic links) and query params (OAuth/code flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
        const authError = hashParams.get('error') || queryParams.get('error'); // Renamed to avoid conflict

        if (authError) {
          console.error('Auth callback error:', authError);
          setLocation('/');
          return;
        }

        if (accessToken && refreshToken) {
          // Set session from tokens
          const { data, error: setError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (setError) {
            console.error('Session set error:', setError);
            setLocation('/');
            return;
          }

          if (data.session) {
            // Clear hash/query from URL
            window.history.replaceState({}, document.title, window.location.pathname);
            setLocation('/dashboard');
            return;
          }
        }

        // Fallback: check existing session
        const { data, error: sessionError } = await supabase.auth.getSession(); // Renamed 'error'

        if (sessionError) {
          console.error('Session check error:', sessionError);
          setLocation('/');
          return;
        }

        if (data.session) {
          setLocation('/dashboard');
        } else {
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