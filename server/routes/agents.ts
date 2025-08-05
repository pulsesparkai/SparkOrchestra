import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { EncryptionService } from '../services/encryption';
import { supabaseAdmin } from '../lib/supabase';
import Anthropic from '@anthropic-ai/sdk';
import { storage } from '../storage';
import { insertAgentSchema, type Agent } from '../../shared/schema';
import { tokenTracker } from '../services/tokenTracker';

// Extend Request interface for Supabase auth
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email?: string;
    user_metadata?: any;
  };
}

const router = express.Router();

// Middleware to ensure user is authenticated
const requireAuth = async (req: any, res: Response, next: Function) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

router.use(requireAuth);

// POST /api/agents - Create new agent
router.post('/', (async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const userId = authReq.user.id;
    
    // Check agent limits based on user's plan
    const currentAgents = await storage.getAgentsByUserId(userId);
    const agentLimitCheck = await tokenTracker.checkAgentLimit(userId, currentAgents.length);
    
    if (!agentLimitCheck.allowed) {
      return res.status(403).json({
        message: agentLimitCheck.message,
        plan: 'free',
        limit: agentLimitCheck.limit,
        current: currentAgents.length
      });
    }
    
    // Validate request body
    const validatedData = insertAgentSchema.parse({
      ...authReq.body,
      userId
    });

    // Create the agent first
    const agent = await storage.createAgent(validatedData);
    
    // Encrypt and update API key if provided
    if (validatedData.apiKey) {
      const encryptedApiKey = EncryptionService.encrypt(validatedData.apiKey);
      await storage.updateAgent(agent.id, { encryptedApiKey });
    }
    
    // Get updated agent to return
    const updatedAgent = await storage.getAgent(agent.id);
    
    res.status(201).json({
      ...updatedAgent,
      encryptedApiKey: undefined, // Don't return encrypted key
      hasApiKey: !!updatedAgent?.encryptedApiKey
    });
  } catch (error: any) {
    console.error('Error creating agent:', error);
    
    if (error?.name === 'ZodError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      message: 'Failed to create agent',
      error: error?.message || 'Unknown error'
    });
  }
}) as express.RequestHandler);

// GET /api/agents - Get user's agents
router.get('/', (async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const userId = authReq.user.id;
    
    const agents = await storage.getAgentsByUserId(userId);
    
    // Remove encrypted API keys from response
    const sanitizedAgents = agents.map(agent => ({
      ...agent,
      encryptedApiKey: undefined,
      hasApiKey: !!agent.encryptedApiKey
    }));
    
    res.json(sanitizedAgents);
  } catch (error: any) {
    console.error('Error fetching agents:', error);
    res.status(500).json({
      message: 'Failed to fetch agents',
      error: error?.message || 'Unknown error'
    });
  }
}) as express.RequestHandler);

// PUT /api/agents/:id - Update agent
router.put('/:id', async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const userId = authReq.user.id;
    const agentId = authReq.params.id;
    
    // Check if agent belongs to user
    const existingAgent = await storage.getAgent(agentId);
    if (!existingAgent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    if (existingAgent.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Prepare update data
    const updateData = { ...authReq.body };
    
    // Handle API key encryption if provided
    if (updateData.apiKey) {
      const saltRounds = 12;
      const encryptedApiKey = await bcrypt.hash(updateData.apiKey, saltRounds);
      delete updateData.apiKey; // Remove plain text API key
      updateData.encryptedApiKey = encryptedApiKey;
    }

    const updatedAgent = await storage.updateAgent(agentId, updateData);
    
    if (!updatedAgent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    res.json({
      ...updatedAgent,
      encryptedApiKey: undefined,
      hasApiKey: !!updatedAgent.encryptedApiKey
    });
  } catch (error: any) {
    console.error('Error updating agent:', error);
    res.status(500).json({
      message: 'Failed to update agent',
      error: error?.message || 'Unknown error'
    });
  }
});

// DELETE /api/agents/:id - Soft delete agent
router.delete('/:id', (async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const userId = authReq.user.id;
    const agentId = authReq.params.id;
    
    // Check if agent belongs to user
    const existingAgent = await storage.getAgent(agentId);
    if (!existingAgent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    if (existingAgent.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Soft delete by updating deletedAt timestamp
    const softDeletedAgent = await storage.updateAgent(agentId, {
      deletedAt: new Date()
    });
    
    if (!softDeletedAgent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting agent:', error);
    res.status(500).json({
      message: 'Failed to delete agent',
      error: error?.message || 'Unknown error'
    });
  }
}) as express.RequestHandler);

// POST /api/agents/:id/test - Test agent with Anthropic
router.post('/:id/test', async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const userId = authReq.user.id;
    const agentId = authReq.params.id;
    
    // Get agent and verify ownership
    const agent = await storage.getAgent(agentId);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    if (agent.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get API key - use agent's key if available, otherwise fallback to environment
    let apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (agent.encryptedApiKey) {
      // For testing purposes, we would need to decrypt the API key
      // In production, you'd implement proper key decryption
      console.log('Agent has custom API key configured');
    }

    if (!apiKey) {
      return res.status(400).json({
        message: 'No API key available. Please configure an Anthropic API key.',
        requiresApiKey: true
      });
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: apiKey
    });

    // Test prompt
    const testPrompt = authReq.body.prompt || `Hello! I'm testing the connection. Please respond with a brief confirmation that you're working properly.`;
    
    const systemPrompt = agent.prompt || `You are ${agent.name}, a helpful AI assistant with the role of ${agent.role}.`;

    // Make test call to Anthropic
    const response = await anthropic.messages.create({
      model: agent.model || 'claude-sonnet-4-20250514',
      max_tokens: 150,
      system: systemPrompt,
      messages: [
        { role: 'user', content: testPrompt }
      ]
    });

    const responseText = (response.content[0] as any)?.text || 'No response received';

    res.json({
      success: true,
      message: 'Agent test completed successfully',
      testResult: {
        prompt: testPrompt,
        response: responseText,
        model: agent.model || 'claude-sonnet-4-20250514',
        tokensUsed: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)
      }
    });

  } catch (error: any) {
    console.error('Error testing agent:', error);
    
    if (error?.status === 401) {
      return res.status(401).json({
        message: 'Invalid API key. Please check your Anthropic API key configuration.',
        requiresApiKey: true
      });
    }
    
    if (error?.status === 429) {
      return res.status(429).json({
        message: 'Rate limit exceeded. Please try again later.',
        error: 'rate_limit'
      });
    }
    
    res.status(500).json({
      message: 'Failed to test agent',
      error: error?.message || 'Unknown error',
      success: false
    });
  }
}
)

export default router;