import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAgentSchema } from "@shared/schema";
import { testAnthropicConnection } from "./services/anthropic";
import { initializeWebSocket, getWebSocketManager } from "./websocket";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create agent endpoint
  app.post("/api/agents", async (req, res) => {
    try {
      const validatedData = insertAgentSchema.parse(req.body);
      const agent = await storage.createAgent(validatedData);
      res.status(201).json(agent);
    } catch (error: any) {
      res.status(400).json({ 
        message: "Failed to create agent", 
        error: error.message 
      });
    }
  });

  // Get all agents
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await storage.getAllAgents();
      res.json(agents);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to fetch agents", 
        error: error.message 
      });
    }
  });

  // Get single agent
  app.get("/api/agents/:id", async (req, res) => {
    try {
      const agent = await storage.getAgent(req.params.id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      res.json(agent);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to fetch agent", 
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
