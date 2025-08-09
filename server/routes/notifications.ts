import express, { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

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

// GET /api/notifications - Get user's notifications
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    const { data: notifications, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) {
      console.error('Error fetching notifications:', error);
      return res.status(500).json({ message: 'Failed to fetch notifications' });
    }

    res.json(notifications || []);
  } catch (error: any) {
    console.error('Error in notifications route:', error);
    res.status(500).json({ 
      message: 'Failed to fetch notifications',
      error: error.message 
    });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return res.status(500).json({ message: 'Failed to mark notification as read' });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error in mark as read route:', error);
    res.status(500).json({ 
      message: 'Failed to mark notification as read',
      error: error.message 
    });
  }
});

// PUT /api/notifications/mark-all-read - Mark all notifications as read
router.put('/mark-all-read', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return res.status(500).json({ message: 'Failed to mark all notifications as read' });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error in mark all as read route:', error);
    res.status(500).json({ 
      message: 'Failed to mark all notifications as read',
      error: error.message 
    });
  }
});

// POST /api/notifications - Create notification (system use)
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user_id, title, message, type = 'info' } = req.body;

    if (!user_id || !title || !message) {
      return res.status(400).json({ 
        message: 'Missing required fields: user_id, title, message' 
      });
    }

    const { data: notification, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id,
        title,
        message,
        type,
        read: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return res.status(500).json({ message: 'Failed to create notification' });
    }

    res.status(201).json(notification);
  } catch (error: any) {
    console.error('Error in create notification route:', error);
    res.status(500).json({ 
      message: 'Failed to create notification',
      error: error.message 
    });
  }
});

export default router;