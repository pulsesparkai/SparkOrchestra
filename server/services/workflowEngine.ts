import { conductor } from '../conductor';
import { storage } from '../storage';
import { getWebSocketManager } from '../websocket';
import { workflowDatabase } from './workflowDatabase';
import { tokenTracker } from './tokenTracker';
import type { Agent } from '../../shared/schema';

export interface WorkflowNode {
  id: string;
  agentId: string;
  position: { x: number; y: number };
  data: Agent;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  userId: string;
  graph: WorkflowGraph;
  executionOrder: string[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  startTime: Date;
  endTime?: Date;
  currentStep: number;
  totalSteps: number;
  logs: WorkflowExecutionLog[];
  context: Record<string, any>;
}

export interface WorkflowExecutionLog {
  id: string;
  workflowExecutionId: string;
  stepNumber: number;
  agentId: string;
  agentName: string;
  action: string;
  input?: any;
  output?: any;
  status: 'started' | 'completed' | 'failed' | 'skipped';
  timestamp: Date;
  duration?: number;
  tokensUsed?: number;
  error?: string;
}

export class WorkflowExecutionEngine {
  private executions: Map<string, WorkflowExecution> = new Map();
  private wsManager = getWebSocketManager();

  /**
   * Parse workflow graph to determine execution order using topological sort
   */
  parseExecutionOrder(graph: WorkflowGraph): string[] {
    const { nodes, edges } = graph;
    
    // Create adjacency list and in-degree count
    const adjacencyList: Map<string, string[]> = new Map();
    const inDegree: Map<string, number> = new Map();
    
    // Initialize all nodes
    nodes.forEach(node => {
      adjacencyList.set(node.id, []);
      inDegree.set(node.id, 0);
    });
    
    // Build adjacency list and calculate in-degrees
    edges.forEach(edge => {
      const sourceNeighbors = adjacencyList.get(edge.source) || [];
      sourceNeighbors.push(edge.target);
      adjacencyList.set(edge.source, sourceNeighbors);
      
      const targetInDegree = inDegree.get(edge.target) || 0;
      inDegree.set(edge.target, targetInDegree + 1);
    });
    
    // Topological sort using Kahn's algorithm
    const queue: string[] = [];
    const executionOrder: string[] = [];
    
    // Add all nodes with no incoming edges to queue
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId);
      }
    });
    
    while (queue.length > 0) {
      const currentNode = queue.shift()!;
      executionOrder.push(currentNode);
      
      // Reduce in-degree of neighbors
      const neighbors = adjacencyList.get(currentNode) || [];
      neighbors.forEach(neighbor => {
        const newInDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newInDegree);
        
        if (newInDegree === 0) {
          queue.push(neighbor);
        }
      });
    }
    
    // Check for cycles
    if (executionOrder.length !== nodes.length) {
      throw new Error('Workflow contains cycles and cannot be executed');
    }
    
    return executionOrder;
  }

  /**
   * Execute workflow from graph definition
   */
  async executeWorkflow(
    workflowId: string,
    userId: string,
    graph: WorkflowGraph
  ): Promise<WorkflowExecution> {
    try {
      // Check token limits before starting workflow
      const totalEstimatedTokens = graph.nodes.reduce((total, node) => {
        return total + tokenTracker.estimateTokens(node.data.prompt);
      }, 0);

      const tokenCheck = await tokenTracker.checkTokenLimit(userId, totalEstimatedTokens);
      if (!tokenCheck.allowed) {
        throw new Error(`Token limit exceeded: ${tokenCheck.message}`);
      }

      // Parse execution order
      const executionOrder = this.parseExecutionOrder(graph);
      
      // Validate all agents exist and belong to user
      const agentIds = graph.nodes.map(node => node.agentId);
      const agents = await Promise.all(
        agentIds.map(async (agentId) => {
          const agent = await storage.getAgent(agentId);
          if (!agent || agent.userId !== userId) {
            throw new Error(`Agent ${agentId} not found or unauthorized`);
          }
          return agent;
        })
      );

      // Create workflow execution record
      const execution: WorkflowExecution = {
        id: `exec-${Date.now()}`,
        workflowId,
        userId,
        graph,
        executionOrder,
        status: 'running',
        startTime: new Date(),
        currentStep: 0,
        totalSteps: executionOrder.length,
        logs: [],
        context: {}
      };

      this.executions.set(execution.id, execution);

      // Save to database
      await workflowDatabase.saveExecution(execution);

      // Emit workflow started
      this.wsManager?.emitWorkflowProgress({
        workflowId,
        agentId: 'engine',
        status: 'running',
        progress: 0,
        message: `Started workflow execution with ${execution.totalSteps} steps`
      });

      // Add initial log
      await this.addExecutionLog(execution, 'workflow-engine', 'workflow_started', {
        executionOrder,
        totalSteps: execution.totalSteps
      });

      // Execute steps in order
      await this.executeSteps(execution);

      return execution;

    } catch (error: any) {
      // Emit error
      this.wsManager?.emitWorkflowProgress({
        workflowId,
        agentId: 'engine',
        status: 'error',
        progress: 0,
        message: `Workflow failed: ${error.message}`
      });

      throw error;
    }
  }

  /**
   * Execute workflow steps in determined order
   */
  private async executeSteps(execution: WorkflowExecution): Promise<void> {
    for (let i = 0; i < execution.executionOrder.length; i++) {
      const nodeId = execution.executionOrder[i];
      const node = execution.graph.nodes.find(n => n.id === nodeId);
      
      if (!node) {
        throw new Error(`Node ${nodeId} not found in workflow graph`);
      }

      execution.currentStep = i + 1;
      const progress = execution.currentStep / execution.totalSteps;

      // Check if workflow was paused
      if (execution.status === 'paused') {
        await this.waitForResume(execution.id);
      }

      // Check if workflow was aborted
      if (execution.status === 'failed') {
        break;
      }

      try {
        // Prepare input context from previous steps
        const inputContext = this.prepareInputContext(execution, nodeId);
        
        // Execute agent step
        await this.executeAgentStep(execution, node, inputContext);

        // Emit progress update
        this.wsManager?.emitWorkflowProgress({
          workflowId: execution.workflowId,
          agentId: node.agentId,
          status: 'complete',
          progress,
          message: `Completed step ${execution.currentStep}/${execution.totalSteps}: ${node.data.name}`
        });

      } catch (error: any) {
        execution.status = 'failed';
        execution.endTime = new Date();

        await this.addExecutionLog(execution, node.agentId, 'step_failed', {
          stepNumber: execution.currentStep,
          error: error.message
        });

        this.wsManager?.emitWorkflowProgress({
          workflowId: execution.workflowId,
          agentId: node.agentId,
          status: 'error',
          progress,
          message: `Step ${execution.currentStep} failed: ${error.message}`
        });

        throw error;
      }
    }

    // Mark as completed
    execution.status = 'completed';
    execution.endTime = new Date();

    // Update database
    await workflowDatabase.updateExecution(execution.id, {
      status: execution.status,
      endTime: execution.endTime,
      currentStep: execution.currentStep,
      context: execution.context
    });

    await this.addExecutionLog(execution, 'workflow-engine', 'workflow_completed', {
      duration: execution.endTime.getTime() - execution.startTime.getTime(),
      totalSteps: execution.totalSteps
    });

    this.wsManager?.emitWorkflowProgress({
      workflowId: execution.workflowId,
      agentId: 'engine',
      status: 'complete',
      progress: 1,
      message: `Workflow completed successfully in ${execution.endTime.getTime() - execution.startTime.getTime()}ms`
    });
  }

  /**
   * Execute a single agent step
   */
  private async executeAgentStep(
    execution: WorkflowExecution,
    node: WorkflowNode,
    inputContext: any
  ): Promise<void> {
    const startTime = new Date();
    
    // Add step started log
    await this.addExecutionLog(execution, node.agentId, 'step_started', {
      stepNumber: execution.currentStep,
      agentName: node.data.name,
      input: inputContext
    });

    try {
      // Use conductor to execute the agent
      const result = await conductor.executeAgent(node.agentId, {
        workflowId: execution.workflowId,
        agents: [node.data],
        currentData: { ...execution.context, currentInput: inputContext },
        executionLog: execution.logs.map(log => ({
          timestamp: log.timestamp,
          agentId: log.agentId,
          action: log.action,
          input: log.input,
          output: log.output,
          status: log.status === 'completed' ? 'success' : log.status === 'failed' ? 'error' : log.status === 'skipped' ? 'skipped' : 'success',
          error: log.error
        })),
        status: 'running'
      });

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      // Store result in execution context
      execution.context[node.id] = {
        agentId: node.agentId,
        agentName: node.data.name,
        result,
        timestamp: endTime.toISOString(),
        duration
      };

      // Add completion log
      await this.addExecutionLog(execution, node.agentId, 'step_completed', {
        stepNumber: execution.currentStep,
        agentName: node.data.name,
        output: result,
        duration
      });

    } catch (error: any) {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      // Add error log
      await this.addExecutionLog(execution, node.agentId, 'step_failed', {
        stepNumber: execution.currentStep,
        agentName: node.data.name,
        error: error.message,
        duration
      });

      throw error;
    }
  }

  /**
   * Prepare input context for agent based on connections
   */
  private prepareInputContext(execution: WorkflowExecution, nodeId: string): any {
    const inputContext: any = {};
    
    // Find incoming edges to this node
    const incomingEdges = execution.graph.edges.filter(edge => edge.target === nodeId);
    
    // Collect outputs from source nodes
    incomingEdges.forEach(edge => {
      const sourceOutput = execution.context[edge.source];
      if (sourceOutput) {
        inputContext[edge.source] = {
          agentName: sourceOutput.agentName,
          result: sourceOutput.result,
          timestamp: sourceOutput.timestamp
        };
      }
    });

    // If no incoming connections, use initial workflow context
    if (incomingEdges.length === 0) {
      inputContext.initialData = execution.context.initialData || null;
    }

    return inputContext;
  }

  /**
   * Add execution log entry
   */
  private async addExecutionLog(
    execution: WorkflowExecution,
    agentId: string,
    action: string,
    data?: any
  ): Promise<void> {
    const log: WorkflowExecutionLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      workflowExecutionId: execution.id,
      stepNumber: execution.currentStep,
      agentId,
      agentName: agentId === 'workflow-engine' ? 'Workflow Engine' : data?.agentName || agentId,
      action,
      input: data?.input,
      output: data?.output,
      status: data?.error ? 'failed' : action.includes('started') ? 'started' : 'completed',
      timestamp: new Date(),
      duration: data?.duration,
      tokensUsed: data?.tokensUsed,
      error: data?.error
    };

    execution.logs.push(log);

    // Save log to database
    await workflowDatabase.saveLog(log);

    // Emit log event
    this.wsManager?.emitLog({
      id: log.id,
      timestamp: log.timestamp,
      agentName: log.agentName,
      agentId: log.agentId,
      message: `${action}: ${data?.error || data?.output?.substring(0, 100) || 'Success'}`,
      level: data?.error ? 'error' : 'info',
      workflowId: execution.workflowId
    });
  }

  /**
   * Get workflow execution status
   */
  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  /**
   * Get all executions for a workflow
   */
  getWorkflowExecutions(workflowId: string): WorkflowExecution[] {
    return Array.from(this.executions.values()).filter(
      exec => exec.workflowId === workflowId
    );
  }

  /**
   * Pause workflow execution
   */
  async pauseExecution(executionId: string): Promise<boolean> {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === 'running') {
      execution.status = 'paused';
      
      await this.addExecutionLog(execution, 'workflow-engine', 'workflow_paused', {
        stepNumber: execution.currentStep
      });

      return true;
    }
    return false;
  }

  /**
   * Resume workflow execution
   */
  async resumeExecution(executionId: string): Promise<boolean> {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === 'paused') {
      execution.status = 'running';
      
      await this.addExecutionLog(execution, 'workflow-engine', 'workflow_resumed', {
        stepNumber: execution.currentStep
      });

      return true;
    }
    return false;
  }

  /**
   * Abort workflow execution
   */
  async abortExecution(executionId: string): Promise<boolean> {
    const execution = this.executions.get(executionId);
    if (execution && (execution.status === 'running' || execution.status === 'paused')) {
      execution.status = 'failed';
      execution.endTime = new Date();
      
      await this.addExecutionLog(execution, 'workflow-engine', 'workflow_aborted', {
        stepNumber: execution.currentStep
      });

      return true;
    }
    return false;
  }

  /**
   * Wait for workflow to be resumed
   */
  private async waitForResume(executionId: string): Promise<void> {
    return new Promise((resolve) => {
      const checkStatus = () => {
        const execution = this.executions.get(executionId);
        if (execution?.status === 'running') {
          resolve();
        } else {
          setTimeout(checkStatus, 1000);
        }
      };
      checkStatus();
    });
  }
}

// Export singleton instance
export const workflowEngine = new WorkflowExecutionEngine();