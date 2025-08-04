import { db } from '../db';
import { executionLimits, tokenUsage } from '../../shared/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { getWebSocketManager } from '../websocket';

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

export class RateLimiter {
  private readonly WORKFLOW_RUNS_PER_HOUR = 10;
  private readonly AGENT_EXECUTIONS_PER_DAY = 100;
  private readonly HANDOFF_DELAY_SECONDS = 5;
  
  private wsManager = getWebSocketManager();

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
   * Get or create execution limits record
   */
  private async getOrCreateLimitsRecord(userId: string, period: string, periodType: 'hour' | 'day') {
    const [existingRecord] = await db
      .select()
      .from(executionLimits)
      .where(and(
        eq(executionLimits.userId, userId),
        eq(executionLimits.period, period),
        eq(executionLimits.periodType, periodType)
      ));

    if (existingRecord) {
      return existingRecord;
    }

    const [newRecord] = await db
      .insert(executionLimits)
      .values({
        id: `limit-${userId}-${periodType}-${period}-${Date.now()}`,
        userId,
        period,
        periodType,
        workflowRuns: 0,
        agentExecutions: 0,
        lastExecution: null
      })
      .returning();

    return newRecord;
  }

  /**
   * Check if user can start a new workflow
   */
  async checkWorkflowLimit(userId: string): Promise<RateLimitCheck> {
    try {
      const hour = this.getCurrentHour();
      const day = this.getCurrentDay();

      // Get current limits
      const hourlyRecord = await this.getOrCreateLimitsRecord(userId, hour, 'hour');
      const dailyRecord = await this.getOrCreateLimitsRecord(userId, day, 'day');

      // Calculate reset times
      const nextHour = new Date();
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
      
      const nextDay = new Date();
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(0, 0, 0, 0);

      const stats: RateLimitStats = {
        userId,
        workflowRuns: {
          current: hourlyRecord.workflowRuns,
          limit: this.WORKFLOW_RUNS_PER_HOUR,
          resetTime: nextHour
        },
        agentExecutions: {
          current: dailyRecord.agentExecutions,
          limit: this.AGENT_EXECUTIONS_PER_DAY,
          resetTime: nextDay
        },
        isBlocked: false
      };

      // Check workflow runs per hour
      if (hourlyRecord.workflowRuns >= this.WORKFLOW_RUNS_PER_HOUR) {
        const waitTime = Math.ceil((nextHour.getTime() - Date.now()) / 1000);
        return {
          allowed: false,
          reason: `Workflow limit exceeded. You can run ${this.WORKFLOW_RUNS_PER_HOUR} workflows per hour. Next available in ${Math.ceil(waitTime / 60)} minutes.`,
          stats: { ...stats, isBlocked: true },
          waitTime
        };
      }

      // Check handoff delay
      if (hourlyRecord.lastExecution) {
        const timeSinceLastExecution = Date.now() - new Date(hourlyRecord.lastExecution).getTime();
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

      const dailyRecord = await this.getOrCreateLimitsRecord(userId, day, 'day');
      const hourlyRecord = await this.getOrCreateLimitsRecord(userId, hour, 'hour');

      const nextDay = new Date();
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(0, 0, 0, 0);

      const nextHour = new Date();
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);

      const stats: RateLimitStats = {
        userId,
        workflowRuns: {
          current: hourlyRecord.workflowRuns,
          limit: this.WORKFLOW_RUNS_PER_HOUR,
          resetTime: nextHour
        },
        agentExecutions: {
          current: dailyRecord.agentExecutions,
          limit: this.AGENT_EXECUTIONS_PER_DAY,
          resetTime: nextDay
        },
        isBlocked: false
      };

      // Check daily agent execution limit
      if (dailyRecord.agentExecutions + agentCount > this.AGENT_EXECUTIONS_PER_DAY) {
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
      const now = new Date();

      // Update hourly record
      const hourlyRecord = await this.getOrCreateLimitsRecord(userId, hour, 'hour');
      await db
        .update(executionLimits)
        .set({
          workflowRuns: hourlyRecord.workflowRuns + 1,
          lastExecution: now
        })
        .where(eq(executionLimits.id, hourlyRecord.id));

      // Update daily record
      const dailyRecord = await this.getOrCreateLimitsRecord(userId, day, 'day');
      await db
        .update(executionLimits)
        .set({
          agentExecutions: dailyRecord.agentExecutions + agentCount,
          lastExecution: now
        })
        .where(eq(executionLimits.id, dailyRecord.id));

      // Calculate reset times
      const nextHour = new Date();
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
      
      const nextDay = new Date();
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(0, 0, 0, 0);

      const stats: RateLimitStats = {
        userId,
        workflowRuns: {
          current: hourlyRecord.workflowRuns + 1,
          limit: this.WORKFLOW_RUNS_PER_HOUR,
          resetTime: nextHour
        },
        agentExecutions: {
          current: dailyRecord.agentExecutions + agentCount,
          limit: this.AGENT_EXECUTIONS_PER_DAY,
          resetTime: nextDay
        },
        isBlocked: false
      };

      // Emit warnings if approaching limits
      if (stats.workflowRuns.current >= this.WORKFLOW_RUNS_PER_HOUR * 0.8) {
        this.wsManager?.emitLog({
          id: `workflow-limit-warning-${Date.now()}`,
          timestamp: new Date(),
          agentName: 'Rate Limiter',
          agentId: 'system',
          message: `Warning: ${stats.workflowRuns.current}/${stats.workflowRuns.limit} workflow runs used this hour`,
          level: 'warning'
        });
      }

      if (stats.agentExecutions.current >= this.AGENT_EXECUTIONS_PER_DAY * 0.8) {
        this.wsManager?.emitLog({
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

      const hourlyRecord = await this.getOrCreateLimitsRecord(userId, hour, 'hour');
      const dailyRecord = await this.getOrCreateLimitsRecord(userId, day, 'day');

      const nextHour = new Date();
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
      
      const nextDay = new Date();
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(0, 0, 0, 0);

      return {
        userId,
        workflowRuns: {
          current: hourlyRecord.workflowRuns,
          limit: this.WORKFLOW_RUNS_PER_HOUR,
          resetTime: nextHour
        },
        agentExecutions: {
          current: dailyRecord.agentExecutions,
          limit: this.AGENT_EXECUTIONS_PER_DAY,
          resetTime: nextDay
        },
        isBlocked: hourlyRecord.workflowRuns >= this.WORKFLOW_RUNS_PER_HOUR || 
                   dailyRecord.agentExecutions >= this.AGENT_EXECUTIONS_PER_DAY
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

export const rateLimiter = new RateLimiter();