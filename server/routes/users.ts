import express, { Request, Response } from 'express';
import { supabaseAdmin, adminDb } from '../lib/supabase';

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

export default router;