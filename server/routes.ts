import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAgentSchema } from "@shared/schema";
import { testAnthropicConnection } from "./services/anthropic";
import { initializeWebSocket, getWebSocketManager } from "./websocket";
import agentRoutes from "./routes/agents";
import { conductor } from "./conductor";
import { workflowEngine } from "./services/workflowEngine";
import { tokenTracker } from "./services/tokenTracker";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Key validation endpoint
  app.post("/api/validate-api-key", async (req, res) => {
    try {
      const { apiKey } = req.body;
      
      if (!apiKey) {
        return res.status(400).json({ valid: false, error: "API key is required" });
      }

      // Basic format validation
      if (!apiKey.startsWith('sk-ant-')) {
        return res.status(400).json({ 
          valid: false, 
          error: "API key must start with 'sk-ant-'" 
        });
      }

      if (apiKey.length < 20) {
        return res.status(400).json({ 
          valid: false, 
          error: "API key format is invalid" 
        });
      }

      // For development, we'll do basic validation
      return res.json({ 
        valid: true, 
        message: "API key format is valid" 
      });
    } catch (error) {
      console.error("API key validation error:", error);
      res.status(500).json({ 
        valid: false, 
        error: "Internal server error during validation" 
      });
    }
  });

  // Use the new agent routes with Clerk authentication and bcryptjs encryption
  app.use('/api/agents', agentRoutes);

  // Import enhanced workflow routes with token enforcement
  const { registerWorkflowRoutes } = await import('./routes/workflows');
  registerWorkflowRoutes(app);

  app.get("/api/workflows/:id/status", (req, res) => {
    try {
      const workflowId = req.params.id;
      const status = conductor.getWorkflowStatus(workflowId);
      
      if (!status) {
        return res.status(404).json({ message: "Workflow not found" });
      }
      
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to get workflow status", 
        error: error.message 
      });
    }
  });

  app.post("/api/workflows/:id/intervene", async (req, res) => {
    try {
      const workflowId = req.params.id;
      const { agentId, action } = req.body;
      
      if (!agentId || !action) {
        return res.status(400).json({ message: "Agent ID and action are required" });
      }
      
      await conductor.intervene(workflowId, agentId, action);
      res.json({ success: true, message: `${action} intervention applied` });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to apply intervention", 
        error: error.message 
      });
    }
  });

  // NEW: Workflow execution engine endpoint
  app.post("/api/workflows/:id/run", async (req, res) => {
    try {
      const workflowId = req.params.id;
      const { userId, graph } = req.body;
      
      if (!graph || !graph.nodes || !graph.edges) {
        return res.status(400).json({ message: "Invalid workflow graph structure" });
      }
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const execution = await workflowEngine.executeWorkflow(workflowId, userId, graph);
      res.json({
        success: true,
        executionId: execution.id,
        workflowId: execution.workflowId,
        executionOrder: execution.executionOrder,
        totalSteps: execution.totalSteps,
        status: execution.status
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to execute workflow", 
        error: error.message 
      });
    }
  });

  app.get("/api/workflows/:id/executions", (req, res) => {
    try {
      const workflowId = req.params.id;
      const executions = workflowEngine.getWorkflowExecutions(workflowId);
      
      // Return sanitized execution data
      const sanitizedExecutions = executions.map(exec => ({
        id: exec.id,
        workflowId: exec.workflowId,
        status: exec.status,
        startTime: exec.startTime,
        endTime: exec.endTime,
        currentStep: exec.currentStep,
        totalSteps: exec.totalSteps,
        progress: exec.currentStep / exec.totalSteps,
        logsCount: exec.logs.length
      }));
      
      res.json(sanitizedExecutions);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to get workflow executions", 
        error: error.message 
      });
    }
  });

  app.get("/api/executions/:id", (req, res) => {
    try {
      const executionId = req.params.id;
      const execution = workflowEngine.getExecution(executionId);
      
      if (!execution) {
        return res.status(404).json({ message: "Execution not found" });
      }
      
      res.json(execution);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to get execution details", 
        error: error.message 
      });
    }
  });

  app.post("/api/executions/:id/control", async (req, res) => {
    try {
      const executionId = req.params.id;
      const { action } = req.body;
      
      if (!action || !['pause', 'resume', 'abort'].includes(action)) {
        return res.status(400).json({ message: "Invalid action. Use 'pause', 'resume', or 'abort'" });
      }
      
      let success = false;
      
      switch (action) {
        case 'pause':
          success = await workflowEngine.pauseExecution(executionId);
          break;
        case 'resume':
          success = await workflowEngine.resumeExecution(executionId);
          break;
        case 'abort':
          success = await workflowEngine.abortExecution(executionId);
          break;
      }
      
      if (success) {
        res.json({ success: true, message: `Execution ${action}ed successfully` });
      } else {
        res.status(400).json({ success: false, message: `Failed to ${action} execution` });
      }
    } catch (error: any) {
      res.status(500).json({ 
        message: `Failed to ${req.body.action} execution`, 
        error: error.message 
      });
    }
  });

  // Token usage endpoints
  app.get("/api/tokens/usage", async (req, res) => {
    try {
      const userId = 'demo-user'; // TODO: Get from auth context
      const usage = await tokenTracker.getTokenUsage(userId);
      res.json(usage);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to get token usage", 
        error: error.message 
      });
    }
  });

  app.get("/api/tokens/usage/history", async (req, res) => {
    try {
      const userId = 'demo-user'; // TODO: Get from auth context
      const history = await tokenTracker.getTokenUsageHistory(userId);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to get token usage history", 
        error: error.message 
      });
    }
  });

  app.post("/api/tokens/check-limit", async (req, res) => {
    try {
      const userId = 'demo-user'; // TODO: Get from auth context
      const { estimatedTokens } = req.body;
      const result = await tokenTracker.checkTokenLimit(userId, estimatedTokens || 100);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to check token limit", 
        error: error.message 
      });
    }
  });

  app.post("/api/tokens/reset", async (req, res) => {
    try {
      const userId = 'demo-user'; // TODO: Get from auth context
      const { month } = req.body;
      await tokenTracker.resetTokenUsage(userId, month);
      res.json({ success: true, message: "Token usage reset successfully" });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to reset token usage", 
        error: error.message 
      });
    }
  });

  app.get("/api/conductor/metrics", (req, res) => {
    try {
      const activeWorkflows = conductor.getActiveWorkflows();
      const metrics = {
        totalWorkflows: activeWorkflows.length,
        activeWorkflows: activeWorkflows.filter(w => w.status === 'running').length,
        pausedWorkflows: activeWorkflows.filter(w => w.status === 'paused').length,
        successRate: 0.92, // Mock success rate
        timestamp: new Date().toISOString()
      };
      
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to get conductor metrics", 
        error: error.message 
      });
    }
  });

  // Update agent
  app.patch("/api/agents/:id", async (req, res) => {
    try {
      const agent = await storage.updateAgent(req.params.id, req.body);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      res.json(agent);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to update agent", 
        error: error.message 
      });
    }
  });

  // Delete agent
  app.delete("/api/agents/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAgent(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Agent not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to delete agent", 
        error: error.message 
      });
    }
  });

  // Workflow execution endpoints
  app.post("/api/workflows/run", async (req, res) => {
    try {
      const { workflowId, agentIds } = req.body;
      
      if (!workflowId || !agentIds || !Array.isArray(agentIds)) {
        return res.status(400).json({ 
          message: "Missing required fields: workflowId and agentIds array" 
        });
      }

      const wsManager = getWebSocketManager();
      if (wsManager) {
        // Start workflow simulation
        wsManager.simulateWorkflow(workflowId, agentIds);
        
        // Emit conductor event
        wsManager.emitConductorEvent({
          type: "intervention",
          workflowId,
          message: `Workflow ${workflowId} started with ${agentIds.length} agents`,
          timestamp: new Date()
        });
      }

      res.json({ 
        message: "Workflow started successfully",
        workflowId,
        agentCount: agentIds.length 
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to start workflow", 
        error: error.message 
      });
    }
  });

  app.post("/api/workflows/:id/pause", async (req, res) => {
    try {
      const { id } = req.params;
      const wsManager = getWebSocketManager();
      
      if (wsManager) {
        wsManager.emitConductorEvent({
          type: "pause",
          workflowId: id,
          message: `Workflow ${id} paused by conductor`,
          timestamp: new Date()
        });
      }

      res.json({ message: "Workflow paused" });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to pause workflow", 
        error: error.message 
      });
    }
  });

  app.post("/api/workflows/:id/resume", async (req, res) => {
    try {
      const { id } = req.params;
      const wsManager = getWebSocketManager();
      
      if (wsManager) {
        wsManager.emitConductorEvent({
          type: "resume",
          workflowId: id,
          message: `Workflow ${id} resumed by conductor`,
          timestamp: new Date()
        });
      }

      res.json({ message: "Workflow resumed" });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to resume workflow", 
        error: error.message 
      });
    }
  });

  // Test agent with Anthropic
  app.post("/api/agents/:id/test", async (req, res) => {
    try {
      const agent = await storage.getAgent(req.params.id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }

      const testResult = await testAnthropicConnection(agent);
      res.json(testResult);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to test agent", 
        error: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  
  // Initialize WebSocket server
  initializeWebSocket(httpServer);

  return httpServer;
}
