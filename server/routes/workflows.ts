import type { Express } from "express";
import { conductor } from "../conductor";
import { tokenTracker } from "../services/tokenTracker";
import { storage } from "../storage";

export function registerWorkflowRoutes(app: Express) {
  // Start workflow with token enforcement
  app.post("/api/workflows/:id/start", async (req, res) => {
    try {
      const { id: workflowId } = req.params;
      const { agentIds, executionMode = 'sequential', dependencies = [] } = req.body;
      const userId = 'demo-user'; // TODO: Get from auth context

      if (!agentIds || !Array.isArray(agentIds) || agentIds.length === 0) {
        return res.status(400).json({ 
          error: "Agent IDs are required",
          message: "Please provide at least one agent ID to execute" 
        });
      }

      // Pre-flight token check for all agents using platform credits
      let totalEstimatedTokens = 0;
      const agentsWithoutApiKeys = [];

      for (const agentId of agentIds) {
        const agent = await storage.getAgent(agentId);
        if (!agent) {
          return res.status(404).json({ 
            error: "Agent not found",
            message: `Agent ${agentId} does not exist` 
          });
        }

        // Only count tokens for agents without custom API keys
        if (!agent.encryptedApiKey) {
          const estimatedTokens = tokenTracker.estimateTokens(agent.prompt);
          totalEstimatedTokens += estimatedTokens;
          agentsWithoutApiKeys.push(agent.name);
        }
      }

      // Check if user has enough tokens for all platform agents
      if (totalEstimatedTokens > 0) {
        const tokenCheck = await tokenTracker.checkTokenLimit(userId, totalEstimatedTokens);
        
        if (!tokenCheck.allowed) {
          // Calculate next reset date
          const nextMonth = new Date();
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          nextMonth.setDate(1);
          const nextResetDate = nextMonth.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric',
            year: 'numeric'
          });

          return res.status(429).json({
            error: "Token limit exceeded",
            message: tokenCheck.message,
            details: {
              tokensRequired: totalEstimatedTokens,
              tokensUsed: tokenCheck.stats?.tokensUsed || 0,
              tokensLimit: tokenCheck.stats?.tokenLimit || 0,
              nextResetDate,
              agentsAffected: agentsWithoutApiKeys,
              suggestions: [
                "Add your own Anthropic API key to agents for unlimited usage",
                "Upgrade your plan for more Orchestra credits",
                `Wait until ${nextResetDate} for token reset`
              ]
            }
          });
        }
      }

      // Start workflow execution
      const context = await conductor.orchestrateWorkflow(workflowId, agentIds, userId, executionMode, dependencies);
      
      res.json({
        success: true,
        workflowId,
        status: context.status,
        message: `Workflow started with ${agentIds.length} agents in ${executionMode} mode`,
        estimatedTokens: totalEstimatedTokens,
        agentsWithApiKeys: agentIds.length - agentsWithoutApiKeys.length,
        agentsUsingCredits: agentsWithoutApiKeys.length,
        executionMode,
        parallelMetrics: context.parallelMetrics
      });

    } catch (error: any) {
      console.error('Workflow start error:', error);
      
      if (error.name === 'TokenLimitError') {
        return res.status(429).json({
          error: "Token limit exceeded",
          message: error.message
        });
      }

      res.status(500).json({ 
        error: "Failed to start workflow",
        message: error.message 
      });
    }
  });

  // Get workflow status
  app.get("/api/workflows/:id/status", async (req, res) => {
    try {
      const { id: workflowId } = req.params;
      const context = await conductor.getWorkflowStatus(workflowId);
      
      if (!context) {
        return res.status(404).json({ 
          error: "Workflow not found",
          message: `Workflow ${workflowId} does not exist or has not been started` 
        });
      }

      res.json({
        workflowId,
        status: context.status,
        startTime: context.startTime,
        endTime: context.endTime,
        agents: context.agents.map(agent => ({
          id: agent.id,
          name: agent.name,
          role: agent.role
        })),
        executionLog: context.executionLog.slice(-10), // Last 10 log entries
        currentData: Object.keys(context.currentData)
      });

    } catch (error: any) {
      console.error('Workflow status error:', error);
      res.status(500).json({ 
        error: "Failed to get workflow status",
        message: error.message 
      });
    }
  });

  // Conductor interventions
  app.post("/api/workflows/:id/intervene", async (req, res) => {
    try {
      const { id: workflowId } = req.params;
      const { action, agentId } = req.body;

      if (!action) {
        return res.status(400).json({ 
          error: "Action required",
          message: "Please specify an intervention action" 
        });
      }

      const result = await conductor.intervene(workflowId, action, agentId);
      
      res.json({
        success: true,
        workflowId,
        action,
        agentId,
        message: `Intervention ${action} applied successfully`
      });

    } catch (error: any) {
      console.error('Conductor intervention error:', error);
      res.status(500).json({ 
        error: "Intervention failed",
        message: error.message 
      });
    }
  });

  // Get user token usage
  app.get("/api/user/tokens", async (req, res) => {
    try {
      const userId = 'demo-user'; // TODO: Get from auth context
      const stats = await tokenTracker.getTokenUsage(userId);
      
      res.json({
        success: true,
        ...stats,
        usageWarning: stats.percentageUsed >= 80 ? "Approaching token limit" : null,
        suggestions: stats.percentageUsed >= 80 ? [
          "Add your own Anthropic API key for unlimited usage",
          "Upgrade to Early Adopter for 10x more tokens"
        ] : []
      });

    } catch (error: any) {
      console.error('Token usage error:', error);
      res.status(500).json({ 
        error: "Failed to get token usage",
        message: error.message 
      });
    }
  });
}