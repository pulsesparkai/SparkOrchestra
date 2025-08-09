import express, { Request, Response } from 'express';
import { supabaseAdmin, adminDb } from '../lib/supabase';
import { EncryptionService } from '../services/encryption';
import Anthropic from '@anthropic-ai/sdk';

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

// GET /api/users/me - Get current user profile with usage stats
router.get('/me', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;
    
    // Get user from database
    const { data: user, error: userError } = await adminDb.getUserById(userId);

    if (userError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get agent count
    const { data: userAgents, error: agentsError } = await adminDb.getUserAgents(userId);
    const agentCount = userAgents?.length || 0;

    // Get current month token usage
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const { data: usage, error: usageError } = await adminDb.getOrCreateTokenUsage(userId, currentMonth);

    res.json({
      id: user.id,
      email: user.email || req.user.email,
      username: user.username,
      userPlan: user.user_plan || 'free',
      tokensUsed: usage?.tokens_used || 0,
      agentCount,
      stripeCustomerId: user.stripe_customer_id,
      stripeSubscriptionId: user.stripe_subscription_id
    });
  } catch (error: any) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ 
      message: 'Failed to fetch user data',
      error: error.message 
    });
  }
});

// GET /api/users/me/usage - Get current user's token usage
router.get('/me/usage', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;
    
    // Get user from database for plan info
    const { data: user, error: userError } = await adminDb.getUserById(userId);

    if (userError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get current month token usage
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const { data: usage, error: usageError } = await adminDb.getOrCreateTokenUsage(userId, currentMonth);

    // Get agent count
    const { data: userAgents, error: agentsError } = await adminDb.getUserAgents(userId);
    const agentCount = userAgents?.length || 0;

    // Determine token limits based on plan
    const planLimits = {
      free: 100,
      early_adopter: 1000,
      starter: 2500,
      pro: 10000,
      enterprise: -1 // unlimited
    };

    const userPlan = user.user_plan || 'free';
    const tokenLimit = planLimits[userPlan as keyof typeof planLimits] || 100;

    res.json({
      tokensUsed: usage?.tokens_used || 0,
      tokenLimit,
      plan: userPlan,
      agentCount
    });
  } catch (error: any) {
    console.error('Error fetching user usage:', error);
    res.status(500).json({ 
      message: 'Failed to fetch user usage',
      error: error.message 
    });
  }
});

// POST /api/users/me/api-key - Add/update user's API key
router.post('/me/api-key', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ message: 'API key is required' });
    }

    // Validate API key format
    if (!apiKey.startsWith('sk-ant-') || apiKey.length < 20) {
      return res.status(400).json({ message: 'Invalid API key format' });
    }

    // Test the API key with Anthropic
    try {
      const anthropic = new Anthropic({ apiKey });
      await anthropic.messages.create({
        model: 'claude-3-haiku-20240307', // Use cheapest model for testing
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Test' }],
      });
    } catch (anthropicError: any) {
      if (anthropicError.status === 401) {
        return res.status(400).json({ message: 'Invalid API key - authentication failed' });
      }
      return res.status(400).json({ message: 'API key validation failed' });
    }

    // Encrypt the API key
    const encryptedApiKey = EncryptionService.encrypt(apiKey);

    // Update user record with encrypted API key
    const { error: updateError } = await adminDb.updateUser(userId, {
      encrypted_api_key: encryptedApiKey,
      updated_at: new Date().toISOString()
    });

    if (updateError) {
      console.error('Error updating user API key:', updateError);
      return res.status(500).json({ message: 'Failed to save API key' });
    }

    res.json({ 
      success: true, 
      message: 'API key saved successfully',
      hasApiKey: true
    });
  } catch (error: any) {
    console.error('Error saving API key:', error);
    res.status(500).json({ 
      message: 'Failed to save API key',
      error: error.message 
    });
  }
});

// DELETE /api/users/me/api-key - Remove user's API key
router.delete('/me/api-key', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;

    // Remove API key from user record
    const { error: updateError } = await adminDb.updateUser(userId, {
      encrypted_api_key: null,
      updated_at: new Date().toISOString()
    });

    if (updateError) {
      console.error('Error removing user API key:', updateError);
      return res.status(500).json({ message: 'Failed to remove API key' });
    }

    res.json({ 
      success: true, 
      message: 'API key removed successfully',
      hasApiKey: false
    });
  } catch (error: any) {
    console.error('Error removing API key:', error);
    res.status(500).json({ 
      message: 'Failed to remove API key',
      error: error.message 
    });
  }
});
export default router;