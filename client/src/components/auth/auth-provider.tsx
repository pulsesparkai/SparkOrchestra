import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, auth } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { user: currentUser } = await auth.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
      
      // Connect to Supabase Realtime only after authentication
      if (currentUser) {
        try {
          const { websocketClient } = await import('@/lib/websocket');
          await websocketClient.connect();
          console.log('Connected to Supabase Realtime after authentication');
        } catch (error) {
          console.warn('Failed to connect to Supabase Realtime:', error);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Connect/disconnect realtime based on auth state
      if (session?.user) {
        // User signed in - connect to realtime
        import('@/lib/websocket').then(({ websocketClient }) => {
          websocketClient.connect().catch(error => {
            console.warn('Failed to connect to Supabase Realtime:', error);
          });
        });
      } else {
        // User signed out - disconnect from realtime
        import('@/lib/websocket').then(({ websocketClient }) => {
          websocketClient.disconnect();
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await auth.signIn(email, password);
    setLoading(false);
    return { error };
  };

  const signUp = async (email: string, password: string, username: string) => {
    setLoading(true);
    const { error } = await auth.signUp(email, password, username);
    setLoading(false);
    return { error };
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await auth.signOut();
    setLoading(false);
    return { error };
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}