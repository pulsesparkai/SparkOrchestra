import { adminDb, realtimeBroadcast } from '../lib/supabase';

export interface RateLimitStats {
  userId: string;
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

export interface RateLimitCheck {
  allowed: boolean;
  reason?: string;
  stats: RateLimitStats;
  waitTime?: number; // seconds to wait
}

export class SupabaseRateLimiter {
  private readonly WORKFLOW_RUNS_PER_HOUR = 10;
  private readonly AGENT_EXECUTIONS_PER_DAY = 100;
  private readonly HANDOFF_DELAY_SECONDS = 5;

  /**
   * Get current hour string in format "YYYY-MM-DD-HH"
   */
  private getCurrentHour(): string {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}`;
  }

  /**
   * Get current day string in format "YYYY-MM-DD"
   */
  private getCurrentDay(): string {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
  }

  /**
   * Check if user can start a new workflow
   */
  async checkWorkflowLimit(userId: string): Promise<RateLimitCheck> {
    try {
      const hour = this.getCurrentHour();
      const day = this.getCurrentDay();

      // Get current limits
      const { data: hourlyRecord } = await adminDb.getOrCreateRateLimit(userId, hour, 'hour');
      const { data: dailyRecord } = await adminDb.getOrCreateRateLimit(userId, day, 'day');

      if (!hourlyRecord || !dailyRecord) {
        throw new Error('Failed to retrieve rate limit records');
      }

      // Calculate reset times
      const nextHour = new Date();
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
      
      const nextDay = new Date();
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(0, 0, 0, 0);

      const stats: RateLimitStats = {
        userId,
        workflowRuns: {
          current: hourlyRecord.workflow_runs,
          limit: this.WORKFLOW_RUNS_PER_HOUR,
          resetTime: nextHour
        },
        agentExecutions: {
          current: dailyRecord.agent_executions,
          limit: this.AGENT_EXECUTIONS_PER_DAY,
          resetTime: nextDay
        },
        isBlocked: false
      };

      // Check workflow runs per hour
      if (hourlyRecord.workflow_runs >= this.WORKFLOW_RUNS_PER_HOUR) {
        const waitTime = Math.ceil((nextHour.getTime() - Date.now()) / 1000);
        return {
          allowed: false,
          reason: `Workflow limit exceeded. You can run ${this.WORKFLOW_RUNS_PER_HOUR} workflows per hour. Next available in ${Math.ceil(waitTime / 60)} minutes.`,
          stats: { ...stats, isBlocked: true },
          waitTime
        };
      }

      // Check handoff delay
      if (hourlyRecord.last_execution) {
        const timeSinceLastExecution = Date.now() - new Date(hourlyRecord.last_execution).getTime();
        const remainingDelay = (this.HANDOFF_DELAY_SECONDS * 1000) - timeSinceLastExecution;
        
        if (remainingDelay > 0) {
          const nextExecutionAllowed = new Date(Date.now() + remainingDelay);
          return {
            allowed: false,
            reason: `Please wait ${Math.ceil(remainingDelay / 1000)} seconds between workflow executions.`,
            stats: { ...stats, isBlocked: true, nextExecutionAllowed },
            waitTime: Math.ceil(remainingDelay / 1000)
          };
        }
      }

      return {
        allowed: true,
        stats
      };

    } catch (error: any) {
      console.error('Error checking workflow limit:', error);
      throw new Error(`Workflow limit check failed: ${error.message}`);
    }
  }

  /**
   * Check if user can execute more agents
   */
  async checkAgentExecutionLimit(userId: string, agentCount: number = 1): Promise<RateLimitCheck> {
    try {
      const day = this.getCurrentDay();
      const hour = this.getCurrentHour();

      const { data: dailyRecord } = await adminDb.getOrCreateRateLimit(userId, day, 'day');
      const { data: hourlyRecord } = await adminDb.getOrCreateRateLimit(userId, hour, 'hour');

      if (!dailyRecord || !hourlyRecord) {
        throw new Error('Failed to retrieve rate limit records');
      }

      const nextDay = new Date();
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(0, 0, 0, 0);

      const nextHour = new Date();
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);

      const stats: RateLimitStats = {
        userId,
        workflowRuns: {
          current: hourlyRecord.workflow_runs,
          limit: this.WORKFLOW_RUNS_PER_HOUR,
          resetTime: nextHour
        },
        agentExecutions: {
          current: dailyRecord.agent_executions,
          limit: this.AGENT_EXECUTIONS_PER_DAY,
          resetTime: nextDay
        },
        isBlocked: false
      };

      // Check daily agent execution limit
      if (dailyRecord.agent_executions + agentCount > this.AGENT_EXECUTIONS_PER_DAY) {
        const waitTime = Math.ceil((nextDay.getTime() - Date.now()) / 1000);
        return {
          allowed: false,
          reason: `Daily agent execution limit exceeded. You can execute ${this.AGENT_EXECUTIONS_PER_DAY} agents per day. Resets in ${Math.ceil(waitTime / 3600)} hours.`,
          stats: { ...stats, isBlocked: true },
          waitTime
        };
      }

      return {
        allowed: true,
        stats
      };

    } catch (error: any) {
      console.error('Error checking agent execution limit:', error);
      throw new Error(`Agent execution limit check failed: ${error.message}`);
    }
  }

  /**
   * Record a workflow execution
   */
  async recordWorkflowExecution(userId: string, agentCount: number): Promise<RateLimitStats> {
    try {
      const hour = this.getCurrentHour();
      const day = this.getCurrentDay();
      const now = new Date().toISOString();

      // Update hourly record
      const { data: hourlyRecord } = await adminDb.getOrCreateRateLimit(userId, hour, 'hour');
      if (hourlyRecord) {
        await adminDb.updateRateLimit(hourlyRecord.id, {
          workflow_runs: hourlyRecord.workflow_runs + 1,
          last_execution: now
        });
      }

      // Update daily record
      const { data: dailyRecord } = await adminDb.getOrCreateRateLimit(userId, day, 'day');
      if (dailyRecord) {
        await adminDb.updateRateLimit(dailyRecord.id, {
          agent_executions: dailyRecord.agent_executions + agentCount,
          last_execution: now
        });
      }

      // Calculate reset times
      const nextHour = new Date();
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
      
      const nextDay = new Date();
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(0, 0, 0, 0);

      const stats: RateLimitStats = {
        userId,
        workflowRuns: {
          current: (hourlyRecord?.workflow_runs || 0) + 1,
          limit: this.WORKFLOW_RUNS_PER_HOUR,
          resetTime: nextHour
        },
        agentExecutions: {
          current: (dailyRecord?.agent_executions || 0) + agentCount,
          limit: this.AGENT_EXECUTIONS_PER_DAY,
          resetTime: nextDay
        },
        isBlocked: false
      };

      // Emit warnings if approaching limits
      if (stats.workflowRuns.current >= this.WORKFLOW_RUNS_PER_HOUR * 0.8) {
        await realtimeBroadcast.conductorLog({
          id: `workflow-limit-warning-${Date.now()}`,
          timestamp: new Date(),
          agentName: 'Rate Limiter',
          agentId: 'system',
          message: `Warning: ${stats.workflowRuns.current}/${stats.workflowRuns.limit} workflow runs used this hour`,
          level: 'warning'
        });
      }

      if (stats.agentExecutions.current >= this.AGENT_EXECUTIONS_PER_DAY * 0.8) {
        await realtimeBroadcast.conductorLog({
          id: `agent-limit-warning-${Date.now()}`,
          timestamp: new Date(),
          agentName: 'Rate Limiter',
          agentId: 'system',
          message: `Warning: ${stats.agentExecutions.current}/${stats.agentExecutions.limit} agent executions used today`,
          level: 'warning'
        });
      }

      return stats;

    } catch (error: any) {
      console.error('Error recording workflow execution:', error);
      throw new Error(`Workflow execution recording failed: ${error.message}`);
    }
  }

  /**
   * Get current rate limit stats for user
   */
  async getRateLimitStats(userId: string): Promise<RateLimitStats> {
    try {
      const hour = this.getCurrentHour();
      const day = this.getCurrentDay();

      const { data: hourlyRecord } = await adminDb.getOrCreateRateLimit(userId, hour, 'hour');
      const { data: dailyRecord } = await adminDb.getOrCreateRateLimit(userId, day, 'day');

      const nextHour = new Date();
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
      
      const nextDay = new Date();
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(0, 0, 0, 0);

      return {
        userId,
        workflowRuns: {
          current: hourlyRecord?.workflow_runs || 0,
          limit: this.WORKFLOW_RUNS_PER_HOUR,
          resetTime: nextHour
        },
        agentExecutions: {
          current: dailyRecord?.agent_executions || 0,
          limit: this.AGENT_EXECUTIONS_PER_DAY,
          resetTime: nextDay
        },
        isBlocked: (hourlyRecord?.workflow_runs || 0) >= this.WORKFLOW_RUNS_PER_HOUR || 
                   (dailyRecord?.agent_executions || 0) >= this.AGENT_EXECUTIONS_PER_DAY
      };

    } catch (error: any) {
      console.error('Error getting rate limit stats:', error);
      throw new Error(`Rate limit stats retrieval failed: ${error.message}`);
    }
  }

  /**
   * Apply handoff delay between agent executions
   */
  async applyHandoffDelay(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, this.HANDOFF_DELAY_SECONDS * 1000);
    });
  }

  /**
   * Check if workflow is automated/scheduled and requires BYOAPI
   */
  checkAutomatedWorkflowRequirements(isScheduled: boolean, isRecurring: boolean): {
    requiresByoapi: boolean;
    message?: string;
  } {
    if (isScheduled || isRecurring) {
      return {
        requiresByoapi: true,
        message: "Automated workflows require your own API key. Platform credits can only be used for manual one-time runs."
      };
    }

    return { requiresByoapi: false };
  }
}

export const supabaseRateLimiter = new SupabaseRateLimiter();