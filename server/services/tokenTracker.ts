import { db } from '../db';
import { tokenUsage } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { getWebSocketManager } from '../websocket';

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
  private readonly TOKEN_LIMIT_PER_MONTH = 1000;
  private wsManager = getWebSocketManager();

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
      const month = this.getCurrentMonth();
      const record = await this.getOrCreateUsageRecord(userId, month);

      const stats: TokenUsageStats = {
        userId,
        month,
        tokensUsed: record.tokensUsed,
        tokenLimit: this.TOKEN_LIMIT_PER_MONTH,
        remainingTokens: this.TOKEN_LIMIT_PER_MONTH - record.tokensUsed,
        percentageUsed: (record.tokensUsed / this.TOKEN_LIMIT_PER_MONTH) * 100,
        isLimitExceeded: record.tokensUsed >= this.TOKEN_LIMIT_PER_MONTH
      };

      const wouldExceedLimit = (record.tokensUsed + estimatedTokens) > this.TOKEN_LIMIT_PER_MONTH;

      if (wouldExceedLimit) {
        return {
          allowed: false,
          stats,
          message: `Execution would exceed monthly token limit. Current usage: ${record.tokensUsed}/${this.TOKEN_LIMIT_PER_MONTH} tokens. Estimated tokens needed: ${estimatedTokens}.`
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

      const stats: TokenUsageStats = {
        userId,
        month,
        tokensUsed: newTokensUsed,
        tokenLimit: this.TOKEN_LIMIT_PER_MONTH,
        remainingTokens: this.TOKEN_LIMIT_PER_MONTH - newTokensUsed,
        percentageUsed: (newTokensUsed / this.TOKEN_LIMIT_PER_MONTH) * 100,
        isLimitExceeded: newTokensUsed >= this.TOKEN_LIMIT_PER_MONTH
      };

      // Emit real-time token usage update
      this.wsManager?.emitTokenUsage({
        agentId: agentId || 'system',
        tokensUsed,
        totalTokens: newTokensUsed,
        timestamp: new Date()
      });

      // Emit warning if approaching limit
      if (stats.percentageUsed >= 80 && stats.percentageUsed < 100) {
        this.wsManager?.emitLog({
          id: `token-warning-${Date.now()}`,
          timestamp: new Date(),
          agentName: 'Token Tracker',
          agentId: 'system',
          message: `Warning: ${stats.percentageUsed.toFixed(1)}% of monthly token limit used (${stats.tokensUsed}/${stats.tokenLimit})`,
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