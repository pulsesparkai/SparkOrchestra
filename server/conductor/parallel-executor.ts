import type { Agent } from '../../shared/schema';
import type { AgentDependency, ParallelExecutionMetrics } from '../../shared/schema';
import { getWebSocketManager } from '../websocket-mock';
import type { WorkflowContext } from './index';

export interface ExecutionLevel {
  level: number;
  agents: Agent[];
  dependencies: string[];
}

export class DependencyAnalyzer {
  /**
   * Analyze agent dependencies and group into execution levels
   */
  static analyzeDependencies(agents: Agent[], dependencies: AgentDependency[] = []): ExecutionLevel[] {
    const agentMap = new Map(agents.map(agent => [agent.id, agent]));
    const levels: ExecutionLevel[] = [];
    const processedAgents = new Set<string>();
    let currentLevel = 0;

    // If no dependencies provided, all agents can run in parallel at level 0
    if (dependencies.length === 0) {
      return [{
        level: 0,
        agents: agents,
        dependencies: []
      }];
    }

    // Build dependency map
    const dependencyMap = new Map<string, string[]>();
    dependencies.forEach(dep => {
      dependencyMap.set(dep.agentId, dep.dependsOn);
    });

    while (processedAgents.size < agents.length) {
      const currentLevelAgents: Agent[] = [];
      const currentLevelDeps: string[] = [];

      // Find agents that can run at this level
      for (const agent of agents) {
        if (processedAgents.has(agent.id)) continue;

        const deps = dependencyMap.get(agent.id) || [];
        const canRun = deps.every(depId => processedAgents.has(depId));

        if (canRun) {
          currentLevelAgents.push(agent);
          currentLevelDeps.push(...deps);
          processedAgents.add(agent.id);
        }
      }

      if (currentLevelAgents.length === 0) {
        throw new Error('Circular dependency detected in workflow');
      }

      levels.push({
        level: currentLevel,
        agents: currentLevelAgents,
        dependencies: [...new Set(currentLevelDeps)]
      });

      currentLevel++;
    }

    return levels;
  }

  /**
   * Estimate time savings from parallel execution
   */
  static estimateTimeSavings(levels: ExecutionLevel[], avgAgentTime: number = 30): {
    sequentialTime: number;
    parallelTime: number;
    timeSaved: number;
    efficiency: number;
  } {
    const totalAgents = levels.reduce((sum, level) => sum + level.agents.length, 0);
    const sequentialTime = totalAgents * avgAgentTime;
    const parallelTime = levels.length * avgAgentTime;
    const timeSaved = sequentialTime - parallelTime;
    const efficiency = timeSaved / sequentialTime;

    return {
      sequentialTime,
      parallelTime,
      timeSaved,
      efficiency
    };
  }
}

export class ParallelExecutor {
  private wsManager = getWebSocketManager();
  private executionMetrics: Map<string, ParallelExecutionMetrics> = new Map();

  /**
   * Execute agents in parallel levels
   */
  async executeParallel(
    context: WorkflowContext,
    executeAgentFn: (agentId: string, context: WorkflowContext) => Promise<any>
  ): Promise<ParallelExecutionMetrics> {
    const startTime = new Date();
    const levels = DependencyAnalyzer.analyzeDependencies(context.agents);
    
    const metrics: ParallelExecutionMetrics = {
      workflowId: context.workflowId,
      totalAgents: context.agents.length,
      executionLevels: levels.length,
      sequentialTime: 0,
      parallelTime: 0,
      timeSaved: 0,
      agentMetrics: []
    };

    this.executionMetrics.set(context.workflowId, metrics);

    // Emit parallel execution started
    this.wsManager?.emitWorkflowProgress({
      workflowId: context.workflowId,
      agentId: 'parallel-executor',
      status: 'running',
      progress: 0,
      message: `Starting parallel execution with ${levels.length} levels`
    });

    try {
      for (let levelIndex = 0; levelIndex < levels.length; levelIndex++) {
        const level = levels[levelIndex];
        
        // Check if workflow was paused
        if (context.status === 'paused') {
          await this.waitForResume(context.workflowId);
        }

        if (context.status === 'error') {
          break;
        }

        await this.executeLevel(level, context, executeAgentFn, metrics);

        // Update progress
        const progress = (levelIndex + 1) / levels.length;
        this.wsManager?.emitWorkflowProgress({
          workflowId: context.workflowId,
          agentId: 'parallel-executor',
          status: 'running',
          progress,
          message: `Completed level ${levelIndex + 1}/${levels.length}`
        });
      }

      // Calculate final metrics
      const endTime = new Date();
      metrics.parallelTime = endTime.getTime() - startTime.getTime();
      metrics.sequentialTime = metrics.agentMetrics.reduce((sum, agent) => sum + agent.duration, 0);
      metrics.timeSaved = metrics.sequentialTime - metrics.parallelTime;

      // Emit completion with metrics
      this.wsManager?.emitWorkflowProgress({
        workflowId: context.workflowId,
        agentId: 'parallel-executor',
        status: 'complete',
        progress: 1,
        message: `Parallel execution completed. Time saved: ${(metrics.timeSaved / 1000).toFixed(1)}s`
      });

      return metrics;

    } catch (error: any) {
      this.wsManager?.emitWorkflowProgress({
        workflowId: context.workflowId,
        agentId: 'parallel-executor',
        status: 'error',
        progress: 0,
        message: `Parallel execution failed: ${error.message}`
      });

      throw error;
    }
  }

  /**
   * Execute all agents in a level simultaneously
   */
  private async executeLevel(
    level: ExecutionLevel,
    context: WorkflowContext,
    executeAgentFn: (agentId: string, context: WorkflowContext) => Promise<any>,
    metrics: ParallelExecutionMetrics
  ): Promise<void> {
    const levelStartTime = new Date();

    // Emit level started
    this.wsManager?.emitWorkflowProgress({
      workflowId: context.workflowId,
      agentId: 'parallel-executor',
      status: 'running',
      progress: 0,
      message: `Starting level ${level.level} with ${level.agents.length} agents`
    });

    // Execute all agents in this level simultaneously
    const agentPromises = level.agents.map(async (agent) => {
      const agentStartTime = new Date();
      
      try {
        // Emit agent started
        this.wsManager?.emitWorkflowProgress({
          workflowId: context.workflowId,
          agentId: agent.id,
          status: 'running',
          progress: 0,
          message: `${agent.name} started in level ${level.level}`
        });

        const result = await executeAgentFn(agent.id, context);
        const agentEndTime = new Date();
        const duration = agentEndTime.getTime() - agentStartTime.getTime();

        // Record agent metrics
        metrics.agentMetrics.push({
          agentId: agent.id,
          agentName: agent.name,
          startTime: agentStartTime,
          endTime: agentEndTime,
          duration,
          level: level.level,
          status: 'completed'
        });

        // Emit agent completed
        this.wsManager?.emitWorkflowProgress({
          workflowId: context.workflowId,
          agentId: agent.id,
          status: 'complete',
          progress: 1,
          message: `${agent.name} completed in ${(duration / 1000).toFixed(1)}s`
        });

        return { agentId: agent.id, result, success: true };

      } catch (error: any) {
        const agentEndTime = new Date();
        const duration = agentEndTime.getTime() - agentStartTime.getTime();

        // Record failed agent metrics
        metrics.agentMetrics.push({
          agentId: agent.id,
          agentName: agent.name,
          startTime: agentStartTime,
          endTime: agentEndTime,
          duration,
          level: level.level,
          status: 'failed'
        });

        // Emit agent error
        this.wsManager?.emitWorkflowProgress({
          workflowId: context.workflowId,
          agentId: agent.id,
          status: 'error',
          progress: 0,
          message: `${agent.name} failed: ${error.message}`
        });

        return { agentId: agent.id, error: error.message, success: false };
      }
    });

    // Wait for all agents in this level to complete
    const results = await Promise.allSettled(agentPromises);
    
    // Process results and handle failures
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;

    const levelEndTime = new Date();
    const levelDuration = levelEndTime.getTime() - levelStartTime.getTime();

    // Emit level completed
    this.wsManager?.emitWorkflowProgress({
      workflowId: context.workflowId,
      agentId: 'parallel-executor',
      status: successful > 0 ? 'complete' : 'error',
      progress: 1,
      message: `Level ${level.level} completed: ${successful} successful, ${failed} failed (${(levelDuration / 1000).toFixed(1)}s)`
    });

    // If all agents failed, mark workflow as error
    if (successful === 0 && failed > 0) {
      context.status = 'error';
      throw new Error(`All agents in level ${level.level} failed`);
    }
  }

  /**
   * Get execution metrics for a workflow
   */
  getExecutionMetrics(workflowId: string): ParallelExecutionMetrics | undefined {
    return this.executionMetrics.get(workflowId);
  }

  /**
   * Wait for workflow to be resumed
   */
  private async waitForResume(workflowId: string): Promise<void> {
    return new Promise((resolve) => {
      const checkStatus = () => {
        // This would check the actual workflow status
        // For now, resolve immediately
        resolve();
      };
      setTimeout(checkStatus, 1000);
    });
  }
}

export const parallelExecutor = new ParallelExecutor();