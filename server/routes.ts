import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAgentSchema } from "@shared/schema";
import { testAnthropicConnection } from "./services/anthropic";
import { initializeWebSocket, getWebSocketManager } from "./websocket";
import agentRoutes from "./routes/agents";
import { conductor } from "./conductor";

export async function registerRoutes(app: Express): Promise<Server> {
  // Use the new agent routes with Clerk authentication and bcryptjs encryption
  app.use('/api/agents', agentRoutes);

  // Conductor API endpoints
  app.post("/api/workflows/:id/start", async (req, res) => {
    try {
      const workflowId = req.params.id;
      const { agentIds, userId } = req.body;
      
      if (!agentIds || !Array.isArray(agentIds) || agentIds.length === 0) {
        return res.status(400).json({ message: "Agent IDs are required" });
      }
      
      const context = await conductor.orchestrateWorkflow(workflowId, agentIds, userId);
      res.json(context);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to start workflow", 
        error: error.message 
      });
    }
  });

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
