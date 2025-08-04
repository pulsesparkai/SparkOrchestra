import { useQuery } from '@tanstack/react-query';
import { supabase, db } from '@/lib/supabase';
import { useAuth } from '@/components/auth/auth-provider';
import { queryClient } from '@/lib/queryClient';

export interface RateLimitStats {
  workflowRuns: {
    current: number;
    limit: number;
    resetTime: Date;
  };
  agentExecutions: {
    current: number;
    limit: number;
    resetTime: Date;
  };
  isBlocked: boolean;
  nextExecutionAllowed?: Date;
}

export function useRateLimits() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['rate-limits', user?.id],
    queryFn: async (): Promise<RateLimitStats | null> => {
      if (!user) return null;

      const now = new Date();
      const currentHour = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}`;
      const currentDay = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

      // Get hourly workflow limits
      const { data: hourlyData } = await db.getRateLimits(user.id, currentHour, 'hour');
      
      // Get daily agent execution limits
      const { data: dailyData } = await db.getRateLimits(user.id, currentDay, 'day');

      // Calculate reset times
      const nextHour = new Date();
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
      
      const nextDay = new Date();
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(0, 0, 0, 0);

      const workflowRuns = hourlyData?.workflow_runs || 0;
      const agentExecutions = dailyData?.agent_executions || 0;
      
      // Check for next execution delay (5 seconds minimum between executions)
      let nextExecutionAllowed: Date | undefined;
      if (hourlyData?.last_execution) {
        const lastExecution = new Date(hourlyData.last_execution);
        const nextAllowed = new Date(lastExecution.getTime() + 5000); // 5 seconds
        if (nextAllowed > now) {
          nextExecutionAllowed = nextAllowed;
        }
      }

      return {
        workflowRuns: {
          current: workflowRuns,
          limit: 10, // 10 per hour
          resetTime: nextHour
        },
        agentExecutions: {
          current: agentExecutions,
          limit: 100, // 100 per day
          resetTime: nextDay
        },
        isBlocked: workflowRuns >= 10 || agentExecutions >= 100,
        nextExecutionAllowed
      };
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000 // Consider data stale after 10 seconds
  });
}

export function useRateLimitSubscription() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['rate-limits-subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Subscribe to realtime changes for rate limits
      const subscription = supabase
        .channel('execution_limits')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'execution_limits',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            // Invalidate rate limits query when data changes
            queryClient.invalidateQueries({ queryKey: ['rate-limits', user.id] });
          }
        )
        .subscribe();

      return () => subscription.unsubscribe();
    },
    enabled: !!user
  });
}