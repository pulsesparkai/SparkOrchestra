import { supabaseAdmin } from '../lib/supabase';

export interface CreateNotificationData {
  user_id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'announcement';
}

export class NotificationService {
  /**
   * Create a notification for a user
   */
  static async createNotification(data: CreateNotificationData): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: data.user_id,
          title: data.title,
          message: data.message,
          type: data.type || 'info',
          read: false
        });

      if (error) {
        console.error('Error creating notification:', error);
        throw new Error('Failed to create notification');
      }

      console.log(`📢 Notification created for user ${data.user_id}: ${data.title}`);
    } catch (error) {
      console.error('NotificationService error:', error);
      throw error;
    }
  }

  /**
   * Create workflow completion notification
   */
  static async notifyWorkflowCompleted(userId: string, workflowId: string, agentCount: number, duration: number): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: 'Workflow Completed Successfully',
      message: `Your workflow with ${agentCount} agents completed in ${(duration / 1000).toFixed(1)} seconds.`,
      type: 'success'
    });
  }

  /**
   * Create agent execution error notification
   */
  static async notifyAgentError(userId: string, agentName: string, error: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: 'Agent Execution Failed',
      message: `Agent "${agentName}" encountered an error: ${error.substring(0, 100)}...`,
      type: 'error'
    });
  }

  /**
   * Create token limit warning notification
   */
  static async notifyTokenLimitWarning(userId: string, tokensUsed: number, tokenLimit: number): Promise<void> {
    const percentage = Math.round((tokensUsed / tokenLimit) * 100);
    
    await this.createNotification({
      user_id: userId,
      title: 'Token Limit Warning',
      message: `You've used ${percentage}% of your monthly tokens (${tokensUsed}/${tokenLimit}). Consider adding your API key for unlimited usage.`,
      type: 'warning'
    });
  }

  /**
   * Create feature announcement notification
   */
  static async notifyFeatureAnnouncement(userId: string, title: string, message: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title,
      message,
      type: 'announcement'
    });
  }

  /**
   * Create agent creation success notification
   */
  static async notifyAgentCreated(userId: string, agentName: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: 'Agent Created Successfully',
      message: `Your new agent "${agentName}" is ready to use in workflows.`,
      type: 'success'
    });
  }

  /**
   * Create rate limit exceeded notification
   */
  static async notifyRateLimitExceeded(userId: string, limitType: 'workflow' | 'agent', resetTime: Date): Promise<void> {
    const resetTimeStr = resetTime.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });

    await this.createNotification({
      user_id: userId,
      title: 'Rate Limit Exceeded',
      message: `${limitType === 'workflow' ? 'Workflow execution' : 'Agent execution'} limit reached. Resets at ${resetTimeStr}.`,
      type: 'warning'
    });
  }
}

export const notificationService = NotificationService;