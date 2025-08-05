import Anthropic from '@anthropic-ai/sdk';
import bcrypt from 'bcryptjs';
import { storage } from '../storage';
import { getWebSocketManager } from '../websocket';
import { tokenTracker } from '../services/tokenTracker';
import { EncryptionService } from '../services/encryption';
import type { Agent } from '../../shared/schema';

export interface WorkflowContext {
  workflowId: string;
  agents: Agent[];
  currentData: Record<string, any>;
  executionLog: Array<{
    timestamp: Date;
    agentId: string;
    action: string;
    input?: any;
    output?: any;
    status: 'success' | 'error' | 'skipped';
    error?: string;
  }>;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  startTime?: Date;
  endTime?: Date;
}

export interface AgentExecution {
  agentId: string;
  status: 'idle' | 'running' | 'complete' | 'error' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  tokensUsed?: number;
  error?: string;
}

export class Conductor {
  private workflows: Map<string, WorkflowContext> = new Map();
  private agentExecutions: Map<string, AgentExecution> = new Map();
  private wsManager = getWebSocketManager();

  constructor() {
    // Initialize conductor with system monitoring
    this.startMonitoring();
  }

  /**
   * Orchestrate a workflow by executing agents in sequence or parallel
   */
  async orchestrateWorkflow(workflowId: string, agentIds: string[], userId: string): Promise<WorkflowContext> {
    try {
      // Validate user owns all agents
      const agents = await Promise.all(
        agentIds.map(async (id) => {
          const agent = await storage.getAgent(id);
          if (!agent || agent.userId !== userId) {
            throw new Error(`Agent ${id} not found or unauthorized`);
          }
          return agent;
        })
      );

      // Initialize workflow context
      const context: WorkflowContext = {
        workflowId,
        agents,
        currentData: {},
        executionLog: [],
        status: 'running',
        startTime: new Date()
      };

      this.workflows.set(workflowId, context);

      // Emit workflow started event
      this.wsManager?.emitWorkflowProgress({
        workflowId,
        agentId: 'conductor',
        status: 'running',
        progress: 0,
        message: `Started workflow with ${agents.length} agents`
      });

      // Log workflow initiation
      this.addExecutionLog(context, 'conductor', 'workflow_started', {
        agentIds,
        totalAgents: agents.length
      });

      // Execute agents sequentially (can be modified for parallel execution)
      for (const agent of agents) {
        if (context.status === 'paused') {
          await this.waitForResume(workflowId);
        }

        if (context.status === 'error') {
          break;
        }

        await this.executeAgent(agent.id, context);
      }

      // Mark workflow as completed if no errors
      if (context.status === 'running') {
        context.status = 'completed';
        context.endTime = new Date();
        
        this.wsManager?.emitWorkflowProgress({
          workflowId,
          agentId: 'conductor',
          status: 'complete',
          progress: 1,
          message: `Workflow completed in ${context.endTime.getTime() - (context.startTime?.getTime() || 0)}ms`
        });
      }

      return context;

    } catch (error: any) {
      const context = this.workflows.get(workflowId);
      if (context) {
        context.status = 'error';
        context.endTime = new Date();
        
        this.addExecutionLog(context, 'conductor', 'workflow_error', {
          error: error.message
        });
      }

      this.wsManager?.emitWorkflowProgress({
        workflowId: workflowId || 'unknown',
        agentId: 'conductor',
        status: 'error',
        progress: 0,
        message: `Workflow error: ${error.message}`
      });

      throw error;
    }
  }

  /**
   * Execute a single agent with the given context
   */
  async executeAgent(agentId: string, context: WorkflowContext): Promise<any> {
    const agent = context.agents.find(a => a.id === agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found in workflow context`);
    }

    // Determine API key to use (BYOAPI vs platform)
    let anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    let usingUserKey = false;
    
    if (agent.encryptedApiKey) {
      try {
        anthropicApiKey = EncryptionService.decrypt(agent.encryptedApiKey);
        usingUserKey = true;
      } catch (error) {
        console.error('Failed to decrypt user API key, falling back to platform key:', error);
      }
    }
    
    // Only check token limits if using platform API key (not user's BYOAPI key)
    if (!usingUserKey) {
      const estimatedTokens = 250; // Rough estimate for agent execution
      const tokenCheck = await tokenTracker.checkTokenLimit(agent.userId, estimatedTokens);
      
      if (!tokenCheck.allowed) {
        // Enhanced error with better messaging
        const error = new Error(tokenCheck.message || "Token limit exceeded");
        error.name = "TokenLimitError";
        throw error;
      }
    }

    // Initialize agent execution tracking
    const execution: AgentExecution = {
      agentId,
      status: 'running',
      startTime: new Date()
    };
    this.agentExecutions.set(agentId, execution);

    // Emit agent started event
    this.wsManager?.emitWorkflowProgress({
      workflowId: context.workflowId,
      agentId,
      status: 'running',
      progress: 0,
      message: `Starting ${agent.name} (${agent.role})`
    });

    try {
      // Determine API key to use
      let apiKey = process.env.ANTHROPIC_API_KEY;
      
      if (agent.encryptedApiKey) {
        // For demonstration, we'll use the environment key
        // In production, you'd decrypt the stored key here
        apiKey = process.env.ANTHROPIC_API_KEY;
      }

      if (!apiKey) {
        throw new Error('No Anthropic API key available');
      }

      // Initialize Anthropic client with appropriate API key
      const anthropic = new Anthropic({ apiKey: anthropicApiKey });

      // Prepare system prompt with workflow context
      const systemPrompt = `You are the Orchestra Conductor. Coordinate agents, monitor progress, handle errors. 
      
Current workflow: ${context.workflowId}
Agent role: ${agent.role}
Previous context: ${JSON.stringify(context.currentData, null, 2)}
Execution log: ${context.executionLog.slice(-3).map(log => `${log.timestamp}: ${log.action}`).join(', ')}

${agent.prompt}`;

      // Prepare user prompt with current context
      const userPrompt = Object.keys(context.currentData).length > 0 
        ? `Process the following data and provide your analysis: ${JSON.stringify(context.currentData, null, 2)}`
        : `Begin your task as ${agent.role}. Provide initial analysis or output.`;

      // Execute agent with Anthropic
      const response = await anthropic.messages.create({
        model: agent.model || 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ]
      });

      const responseText = (response.content[0] as any)?.text || 'No response received';
      const actualTokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

      // Only record token usage if using platform API key (not user's BYOAPI key)
      if (!usingUserKey) {
        const userId = agent.userId;
        await tokenTracker.recordTokenUsage(agent.userId, actualTokensUsed, agentId, context.workflowId);
      }

      // Update execution tracking
      execution.status = 'complete';
      execution.endTime = new Date();
      execution.tokensUsed = actualTokensUsed;

      // Update workflow context with agent output
      context.currentData[agent.id] = {
        agentName: agent.name,
        role: agent.role,
        output: responseText,
        timestamp: new Date().toISOString(),
        tokensUsed: actualTokensUsed
      };

      // Log successful execution
      this.addExecutionLog(context, agentId, 'agent_executed', {
        input: userPrompt.substring(0, 100) + '...',
        output: responseText.substring(0, 200) + '...',
        tokensUsed: actualTokensUsed
      });

      // Emit agent completed event
      this.wsManager?.emitWorkflowProgress({
        workflowId: context.workflowId,
        agentId,
        status: 'complete',
        progress: 1,
        message: `${agent.name} completed (${actualTokensUsed} tokens)${usingUserKey ? ' - using user API key' : ' - using platform credits'}`
      });

      // Emit token usage
      this.wsManager?.emitTokenUsage({
        agentId,
        tokensUsed: actualTokensUsed,
        totalTokens: actualTokensUsed,
        timestamp: new Date()
      });

      return responseText;

    } catch (error: any) {
      // Update execution tracking
      execution.status = 'error';
      execution.endTime = new Date();
      execution.error = error.message;

      // Log error
      this.addExecutionLog(context, agentId, 'agent_error', {
        error: error.message
      });

      // Emit agent error event
      this.wsManager?.emitWorkflowProgress({
        workflowId: context.workflowId,
        agentId,
        status: 'error',
        progress: 0,
        message: `${agent.name} failed: ${error.message}`
      });

      // Mark workflow as error if agent fails
      context.status = 'error';
      
      throw error;
    }
  }

  /**
   * Handle handoff between agents with data passing
   */
  async handleHandoff(workflowId: string, fromAgentId: string, toAgentId: string, data: any): Promise<void> {
    const context = this.workflows.get(workflowId);
    if (!context) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    // Update context with handoff data
    context.currentData[`handoff_${fromAgentId}_to_${toAgentId}`] = {
      data,
      timestamp: new Date().toISOString()
    };

    // Log handoff
    this.addExecutionLog(context, fromAgentId, 'handoff', {
      toAgent: toAgentId,
      data: typeof data === 'string' ? data.substring(0, 100) + '...' : data
    });

    // Emit log event for handoff
    this.wsManager?.emitLog({
      id: `handoff-${Date.now()}`,
      timestamp: new Date(),
      agentName: `Agent ${fromAgentId}`,
      agentId: fromAgentId,
      message: `Handed off to Agent ${toAgentId}`,
      level: 'info',
      workflowId
    });
  }

  /**
   * Monitor workflow execution and emit real-time updates
   */
  private startMonitoring(): void {
    setInterval(() => {
      this.monitorExecution();
    }, 3000); // Monitor every 3 seconds
  }

  private monitorExecution(): void {
    const activeWorkflows = Array.from(this.workflows.values()).filter(w => 
      w.status === 'running' || w.status === 'paused'
    );

    const systemMetrics = {
      totalWorkflows: this.workflows.size,
      activeWorkflows: activeWorkflows.length,
      totalAgentExecutions: this.agentExecutions.size,
      timestamp: new Date().toISOString()
    };

    // Emit workflow progress for each active workflow
    activeWorkflows.forEach(workflow => {
      const completedAgents = workflow.agents.filter(agent => {
        const execution = this.agentExecutions.get(agent.id);
        return execution?.status === 'complete';
      }).length;

      this.wsManager?.emitWorkflowProgress({
        workflowId: workflow.workflowId,
        agentId: 'conductor',
        status: workflow.status as any,
        progress: completedAgents / workflow.agents.length,
        message: `Progress: ${completedAgents}/${workflow.agents.length} agents completed`
      });
    });
  }

  /**
   * Intervene in workflow execution
   */
  async intervene(workflowId: string, agentId: string, action: 'pause' | 'resume' | 'retry' | 'skip' | 'abort'): Promise<void> {
    const context = this.workflows.get(workflowId);
    if (!context) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    switch (action) {
      case 'pause':
        context.status = 'paused';
        this.addExecutionLog(context, 'conductor', 'workflow_paused', { agentId });
        break;

      case 'resume':
        if (context.status === 'paused') {
          context.status = 'running';
          this.addExecutionLog(context, 'conductor', 'workflow_resumed', { agentId });
        }
        break;

      case 'retry':
        const execution = this.agentExecutions.get(agentId);
        if (execution) {
          execution.status = 'idle';
          execution.error = undefined;
          this.addExecutionLog(context, 'conductor', 'agent_retry', { agentId });
          // Re-execute the agent
          await this.executeAgent(agentId, context);
        }
        break;

      case 'skip':
        const skipExecution = this.agentExecutions.get(agentId);
        if (skipExecution) {
          skipExecution.status = 'skipped';
          skipExecution.endTime = new Date();
          this.addExecutionLog(context, 'conductor', 'agent_skipped', { agentId });
        }
        break;

      case 'abort':
        context.status = 'error';
        context.endTime = new Date();
        this.addExecutionLog(context, 'conductor', 'workflow_aborted', { agentId });
        break;
    }

    // Emit conductor intervention event
    this.wsManager?.emitConductorEvent({
      type: action as any,
      workflowId,
      agentId,
      message: `${action} applied to agent ${agentId}`,
      timestamp: new Date()
    });
  }

  /**
   * Get workflow status
   */
  getWorkflowStatus(workflowId: string): WorkflowContext | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * Get all active workflows
   */
  getActiveWorkflows(): WorkflowContext[] {
    return Array.from(this.workflows.values()).filter(w => 
      w.status === 'running' || w.status === 'paused'
    );
  }

  /**
   * Helper method to add execution log entries
   */
  private addExecutionLog(context: WorkflowContext, agentId: string, action: string, data?: any): void {
    context.executionLog.push({
      timestamp: new Date(),
      agentId,
      action,
      input: data?.input,
      output: data?.output,
      status: data?.error ? 'error' : 'success',
      error: data?.error
    });

    // Emit log event for real-time monitoring
    this.wsManager?.emitLog({
      id: `log-${Date.now()}`,
      timestamp: new Date(),
      agentName: agentId === 'conductor' ? 'Conductor' : `Agent ${agentId}`,
      agentId,
      message: `${action}: ${data?.error || 'Success'}`,
      level: data?.error ? 'error' : 'info',
      workflowId: context.workflowId
    });
  }

  /**
   * Wait for workflow to be resumed
   */
  private async waitForResume(workflowId: string): Promise<void> {
    return new Promise((resolve) => {
      const checkStatus = () => {
        const context = this.workflows.get(workflowId);
        if (context?.status === 'running') {
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
export const conductor = new Conductor();