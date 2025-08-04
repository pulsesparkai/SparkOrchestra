import { db } from '../db';
import { tokenUsage, users } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { getWebSocketManager } from '../websocket';
import type { User } from '../../shared/schema';

export interface TokenUsageStats {
  userId: string;
  month: string;
  tokensUsed: number;
  tokenLimit: number;
  remainingTokens: number;
  percentageUsed: number;
  isLimitExceeded: boolean;
}

export class TokenTracker {
  private readonly PLAN_LIMITS = {
    free: 100,
    early_adopter: 1000
  };

  private readonly PLAN_AGENT_LIMITS = {
    free: 2,
    early_adopter: -1 // unlimited
  };
  private wsManager = getWebSocketManager();

  /**
   * Get user's plan information
   */
  private async getUserPlan(userId: string): Promise<User> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    
    return user;
  }

  /**
   * Check if user can create more agents based on their plan
   */
  async checkAgentLimit(userId: string, currentAgentCount: number): Promise<{
    allowed: boolean;
    limit: number;
    message?: string;
  }> {
    try {
      const user = await this.getUserPlan(userId);
      const agentLimit = this.PLAN_AGENT_LIMITS[user.userPlan];
      
      // -1 means unlimited
      if (agentLimit === -1) {
        return { allowed: true, limit: -1 };
      }
      
      const allowed = currentAgentCount < agentLimit;
      return {
        allowed,
        limit: agentLimit,
        message: allowed ? undefined : `${user.userPlan === 'free' ? 'Free' : 'Early Adopter'} plan limited to ${agentLimit} agents. Upgrade to create more.`
      };
    } catch (error) {
      console.error('Error checking agent limit:', error);
      return { allowed: false, limit: 0, message: 'Error checking agent limit' };
    }
  }

  /**
   * Get current month string in format "YYYY-MM"
   */
  private getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  /**
   * Get or create token usage record for user and month
   */
  private async getOrCreateUsageRecord(userId: string, month: string) {
    // Try to get existing record
    const [existingRecord] = await db
      .select()
      .from(tokenUsage)
      .where(and(
        eq(tokenUsage.userId, userId),
        eq(tokenUsage.month, month)
      ));

    if (existingRecord) {
      return existingRecord;
    }

    // Create new record
    const [newRecord] = await db
      .insert(tokenUsage)
      .values({
        id: `token-${userId}-${month}-${Date.now()}`,
        userId,
        month,
        tokensUsed: 0
      })
      .returning();

    return newRecord;
  }

  /**
   * Check if user has enough tokens remaining for execution
   */
  async checkTokenLimit(userId: string, estimatedTokens: number = 100): Promise<{
    allowed: boolean;
    stats: TokenUsageStats;
    message?: string;
  }> {
    try {
      // Get user's plan
      const user = await this.getUserPlan(userId);
      const tokenLimit = this.PLAN_LIMITS[user.userPlan];

      const month = this.getCurrentMonth();
      const record = await this.getOrCreateUsageRecord(userId, month);

      const stats: TokenUsageStats = {
        userId,
        month,
        tokensUsed: record.tokensUsed,
        tokenLimit,
        remainingTokens: tokenLimit - record.tokensUsed,
        percentageUsed: (record.tokensUsed / tokenLimit) * 100,
        isLimitExceeded: record.tokensUsed >= tokenLimit
      };

      const wouldExceedLimit = (record.tokensUsed + estimatedTokens) > tokenLimit;

      if (wouldExceedLimit) {
        // Calculate next reset date (first day of next month)
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(1);
        const nextResetDate = nextMonth.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric',
          year: 'numeric'
        });

        return {
          allowed: false,
          stats,
          message: `Monthly token limit reached. Add your API key or wait until ${nextResetDate}`
        };
      }

      return {
        allowed: true,
        stats
      };
    } catch (error: any) {
      console.error('Error checking token limit:', error);
      throw new Error(`Token limit check failed: ${error.message}`);
    }
  }

  /**
   * Record token usage after API call
   */
  async recordTokenUsage(
    userId: string, 
    tokensUsed: number, 
    agentId?: string,
    workflowId?: string
  ): Promise<TokenUsageStats> {
    try {
      const month = this.getCurrentMonth();
      const record = await this.getOrCreateUsageRecord(userId, month);

      // Update token usage
      const newTokensUsed = record.tokensUsed + tokensUsed;
      
      await db
        .update(tokenUsage)
        .set({
          tokensUsed: newTokensUsed,
          lastUpdated: new Date()
        })
        .where(eq(tokenUsage.id, record.id));

      // Get user's plan for accurate token limit
      const user = await this.getUserPlan(userId);
      const tokenLimit = this.PLAN_LIMITS[user.userPlan];

      const stats: TokenUsageStats = {
        userId,
        month,
        tokensUsed: newTokensUsed,
        tokenLimit,
        remainingTokens: tokenLimit - newTokensUsed,
        percentageUsed: (newTokensUsed / tokenLimit) * 100,
        isLimitExceeded: newTokensUsed >= tokenLimit
      };

      // Emit real-time token usage update
      this.wsManager?.emitTokenUsage({
        agentId: agentId || 'system',
        tokensUsed,
        totalTokens: newTokensUsed,
        timestamp: new Date()
      });

      // Emit warning at 80% usage
      if (stats.percentageUsed >= 80 && stats.percentageUsed < 100) {
        this.wsManager?.emitLog({
          id: `token-warning-${Date.now()}`,
          timestamp: new Date(),
          agentName: 'Token Tracker',
          agentId: 'system',
          message: `Warning: ${stats.tokensUsed}/${stats.tokenLimit} tokens used (${stats.percentageUsed.toFixed(0)}%). Consider adding your API key for unlimited usage.`,
          level: 'warning',
          workflowId
        });
      }

      // Emit limit exceeded warning
      if (stats.isLimitExceeded) {
        this.wsManager?.emitLog({
          id: `token-limit-${Date.now()}`,
          timestamp: new Date(),
          agentName: 'Token Tracker',
          agentId: 'system',
          message: `Monthly token limit exceeded! Used ${stats.tokensUsed}/${stats.tokenLimit} tokens`,
          level: 'error',
          workflowId
        });
      }

      return stats;
    } catch (error: any) {
      console.error('Error recording token usage:', error);
      throw new Error(`Token usage recording failed: ${error.message}`);
    }
  }

  /**
   * Get current token usage statistics for user
   */
  async getTokenUsage(userId: string): Promise<TokenUsageStats> {
    try {
      const month = this.getCurrentMonth();
      const record = await this.getOrCreateUsageRecord(userId, month);

      return {
        userId,
        month,
        tokensUsed: record.tokensUsed,
        tokenLimit: this.TOKEN_LIMIT_PER_MONTH,
        remainingTokens: this.TOKEN_LIMIT_PER_MONTH - record.tokensUsed,
        percentageUsed: (record.tokensUsed / this.TOKEN_LIMIT_PER_MONTH) * 100,
        isLimitExceeded: record.tokensUsed >= this.TOKEN_LIMIT_PER_MONTH
      };
    } catch (error: any) {
      console.error('Error getting token usage:', error);
      throw new Error(`Token usage retrieval failed: ${error.message}`);
    }
  }

  /**
   * Get token usage history for user (last 12 months)
   */
  async getTokenUsageHistory(userId: string): Promise<TokenUsageStats[]> {
    try {
      // Generate last 12 months
      const months: string[] = [];
      const now = new Date();
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`);
      }

      // Get usage records for all months
      const records = await db
        .select()
        .from(tokenUsage)
        .where(eq(tokenUsage.userId, userId));

      // Create stats for each month
      const history: TokenUsageStats[] = months.map(month => {
        const record = records.find(r => r.month === month);
        const tokensUsed = record?.tokensUsed || 0;

        return {
          userId,
          month,
          tokensUsed,
          tokenLimit: this.TOKEN_LIMIT_PER_MONTH,
          remainingTokens: this.TOKEN_LIMIT_PER_MONTH - tokensUsed,
          percentageUsed: (tokensUsed / this.TOKEN_LIMIT_PER_MONTH) * 100,
          isLimitExceeded: tokensUsed >= this.TOKEN_LIMIT_PER_MONTH
        };
      });

      return history;
    } catch (error: any) {
      console.error('Error getting token usage history:', error);
      throw new Error(`Token usage history retrieval failed: ${error.message}`);
    }
  }

  /**
   * Reset token usage for testing (admin only)
   */
  async resetTokenUsage(userId: string, month?: string): Promise<void> {
    try {
      const targetMonth = month || this.getCurrentMonth();
      
      await db
        .update(tokenUsage)
        .set({
          tokensUsed: 0,
          lastUpdated: new Date()
        })
        .where(and(
          eq(tokenUsage.userId, userId),
          eq(tokenUsage.month, targetMonth)
        ));

      console.log(`Reset token usage for user ${userId} in month ${targetMonth}`);
    } catch (error: any) {
      console.error('Error resetting token usage:', error);
      throw new Error(`Token usage reset failed: ${error.message}`);
    }
  }

  /**
   * Estimate tokens needed for a prompt (rough estimation)
   */
  estimateTokens(prompt: string): number {
    // Rough estimation: ~4 characters per token
    // Add buffer for system messages and response
    const inputTokens = Math.ceil(prompt.length / 4);
    const responseTokens = 200; // Estimated response tokens
    const systemTokens = 50; // System message overhead
    
    return inputTokens + responseTokens + systemTokens;
  }
}

// Export singleton instance
export const tokenTracker = new TokenTracker();