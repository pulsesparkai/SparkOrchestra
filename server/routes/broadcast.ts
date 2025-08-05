import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

// Endpoint to broadcast events through Supabase Realtime
router.post('/api/broadcast', async (req, res) => {
  try {
    const { channel, event, payload } = req.body;

    if (!channel || !event || !payload) {
      return res.status(400).json({ 
        error: 'Missing required fields: channel, event, payload' 
      });
    }

    // Use Supabase admin client to broadcast
    const { error } = await supabaseAdmin
      .channel(channel)
      .send({
        type: 'broadcast',
        event: event,
        payload: payload
      });

    if (error) {
      console.error('Broadcast error:', error);
      return res.status(500).json({ error: 'Failed to broadcast event' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;