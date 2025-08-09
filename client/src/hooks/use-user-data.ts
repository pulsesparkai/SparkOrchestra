import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-provider";

export interface UserUsageData {
  tokensUsed: number;
  tokenLimit: number;
  plan: string;
  agentCount: number;
}

export interface UserData {
  id: string;
  email: string;
  username: string;
  userPlan: 'free' | 'starter' | 'pro' | 'enterprise';
  tokensUsed: number;
  tokenLimit: number;
  agentCount: number;
  agentLimit: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export function useUserUsage() {
  const { user } = useAuth();
  
  return useQuery<UserUsageData>({
    queryKey: ['/api/users/me/usage'],
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}

export function useUserData() {
  const { user } = useAuth();
  
  const { data, isLoading, error } = useQuery<UserData>({
    queryKey: ['/api/users/me'],
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
  });

  // Map plan names to limits
  const planLimits = {
    free: { tokens: 100, agents: 2 },
    starter: { tokens: 2500, agents: 5 },
    pro: { tokens: 10000, agents: -1 }, // -1 means unlimited
    enterprise: { tokens: -1, agents: -1 }
  };

  const userData = data ? {
    ...data,
    tokenLimit: planLimits[data.userPlan]?.tokens || 100,
    agentLimit: planLimits[data.userPlan]?.agents || 2,
  } : null;

  return { userData, isLoading, error };
}