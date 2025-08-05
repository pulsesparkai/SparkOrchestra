import { db } from '../db';
import { workflowExecutions, workflowExecutionLogs } from '../../shared/schema';
import type { WorkflowExecution, WorkflowExecutionLog } from './workflowEngine';
import { eq, desc } from 'drizzle-orm';

export class WorkflowDatabase {
  /**
   * Save workflow execution to database
   */
  async saveExecution(execution: WorkflowExecution): Promise<void> {
    try {
      await db.insert(workflowExecutions).values({
        id: execution.id,
        workflowId: execution.workflowId,
        userId: execution.userId,
        graph: execution.graph,
        executionOrder: execution.executionOrder,
        status: execution.status,
        startTime: execution.startTime,
        endTime: execution.endTime,
        currentStep: execution.currentStep,
        totalSteps: execution.totalSteps,
        context: execution.context
      });
    } catch (error: any) {
      console.error('Failed to save workflow execution:', error);
      throw new Error(`Database error: ${error.message}`);
    }
  }

  /**
   * Update workflow execution status
   */
  async updateExecution(
    executionId: string, 
    updates: Partial<WorkflowExecution>
  ): Promise<void> {
    try {
      await db
        .update(workflowExecutions)
        .set({
          status: updates.status,
          endTime: updates.endTime,
          currentStep: updates.currentStep,
          totalSteps: updates.totalSteps,
          context: updates.context,
          updatedAt: new Date()
        })
        .where(eq(workflowExecutions.id, executionId));
    } catch (error: any) {
      console.error('Failed to update workflow execution:', error);
      throw new Error(`Database error: ${error.message}`);
    }
  }

  /**
   * Save execution log entry
   */
  async saveLog(log: WorkflowExecutionLog): Promise<void> {
    try {
      await db.insert(workflowExecutionLogs).values({
        id: log.id,
        workflowExecutionId: log.workflowExecutionId,
        stepNumber: log.stepNumber,
        agentId: log.agentId,
        agentName: log.agentName,
        action: log.action,
        input: log.input,
        output: log.output,
        status: log.status,
        timestamp: log.timestamp,
        duration: log.duration,
        tokensUsed: log.tokensUsed,
        error: log.error
      });
    } catch (error: any) {
      console.error('Failed to save execution log:', error);
      // Don't throw error for logs to avoid breaking execution
    }
  }

  /**
   * Get workflow execution by ID
   */
  async getExecution(executionId: string): Promise<WorkflowExecution | null> {
    try {
      const [execution] = await db
        .select()
        .from(workflowExecutions)
        .where(eq(workflowExecutions.id, executionId));

      if (!execution) return null;

      // Get logs for this execution
      const logs = await db
        .select()
        .from(workflowExecutionLogs)
        .where(eq(workflowExecutionLogs.workflowExecutionId, executionId))
        .orderBy(workflowExecutionLogs.timestamp);

      return {
        ...execution,
        logs: logs.map((log: any) => ({
          ...log,
          status: log.status as "completed" | "failed" | "started" | "skipped"
        }))
      } as WorkflowExecution;
    } catch (error: any) {
      console.error('Failed to get workflow execution:', error);
      throw new Error(`Database error: ${error.message}`);
    }
  }

  /**
   * Get all executions for a workflow
   */
  async getWorkflowExecutions(workflowId: string): Promise<WorkflowExecution[]> {
    try {
      const executions = await db
        .select()
        .from(workflowExecutions)
        .where(eq(workflowExecutions.workflowId, workflowId))
        .orderBy(desc(workflowExecutions.createdAt));

      // Get logs for each execution
      const executionsWithLogs = await Promise.all(
        executions.map(async (execution: any) => {
          const logs = await db
            .select()
            .from(workflowExecutionLogs)
            .where(eq(workflowExecutionLogs.workflowExecutionId, execution.id))
            .orderBy(workflowExecutionLogs.timestamp);

          return {
            ...execution,
            logs: logs.map((log: any) => ({
              ...log,
              status: log.status as "completed" | "failed" | "started" | "skipped"
            }))
          } as WorkflowExecution;
        })
      );

      return executionsWithLogs;
    } catch (error: any) {
      console.error('Failed to get workflow executions:', error);
      throw new Error(`Database error: ${error.message}`);
    }
  }

  /**
   * Get execution logs for a specific execution
   */
  async getExecutionLogs(executionId: string): Promise<WorkflowExecutionLog[]> {
    try {
      const logs = await db
        .select()
        .from(workflowExecutionLogs)
        .where(eq(workflowExecutionLogs.workflowExecutionId, executionId))
        .orderBy(workflowExecutionLogs.timestamp);
      
      return logs.map((log: any) => ({
        ...log,
        status: log.status as "completed" | "failed" | "started" | "skipped"
      })) as WorkflowExecutionLog[];
    } catch (error: any) {
      console.error('Failed to get execution logs:', error);
      throw new Error(`Database error: ${error.message}`);
    }
  }

  /**
   * Delete old executions (cleanup)
   */
  async cleanupOldExecutions(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await db
        .delete(workflowExecutions)
        .where(eq(workflowExecutions.createdAt, cutoffDate));

      return result.rowCount || 0;
    } catch (error: any) {
      console.error('Failed to cleanup old executions:', error);
      throw new Error(`Database error: ${error.message}`);
    }
  }
}

// Export singleton instance
export const workflowDatabase = new WorkflowDatabase();