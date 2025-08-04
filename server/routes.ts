import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAgentSchema } from "@shared/schema";
import { testAnthropicConnection } from "./services/anthropic";

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

  // Run workflow endpoint (placeholder)
  app.post("/api/workflow/run", async (req, res) => {
    try {
      // TODO: Implement workflow execution logic
      res.json({ 
        message: "Workflow execution started",
        workflowId: "temp-" + Date.now()
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to run workflow", 
        error: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
