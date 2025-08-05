import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// In development, use placeholder values or skip initialization
if (!supabaseUrl || !supabaseServiceKey) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  } else {
    console.warn('⚠️  Supabase environment variables not set. Database operations will fail.')
    console.warn('⚠️  Create a .env file with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  }
}

// Create a mock client for development if vars are missing
export const supabaseAdmin = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null as any; // Mock for development

// Database operations with admin privileges
export const adminDb = {
  // Users
  getUserById: async (userId: string) => {
    if (!supabaseAdmin) return { data: null, error: new Error('Supabase not configured') };
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  createUser: async (user: any) => {
    if (!supabaseAdmin) return { data: null, error: new Error('Supabase not configured') };
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert(user)
      .select()
      .single()
    return { data, error }
  },

  updateUser: async (userId: string, updates: any) => {
    if (!supabaseAdmin) return { data: null, error: new Error('Supabase not configured') };
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  // Agents with admin access
  getAgent: async (agentId: string) => {
    if (!supabaseAdmin) return { data: null, error: new Error('Supabase not configured') };
    const { data, error } = await supabaseAdmin
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .is('deleted_at', null)
      .single()
    return { data, error }
  },

  getUserAgents: async (userId: string) => {
    if (!supabaseAdmin) return { data: null, error: new Error('Supabase not configured') };
    const { data, error } = await supabaseAdmin
      .from('agents')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Token Usage
  getOrCreateTokenUsage: async (userId: string, month: string) => {
    if (!supabaseAdmin) return { data: null, error: new Error('Supabase not configured') };
    // Try to get existing record
    const { data: existing, error: getError } = await supabaseAdmin
      .from('token_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .single()

    if (existing && !getError) {
      return { data: existing, error: null }
    }

    // Create new record if doesn't exist
    const { data, error } = await supabaseAdmin
      .from('token_usage')
      .insert({
        user_id: userId,
        month,
        tokens_used: 0
      })
      .select()
      .single()

    return { data, error }
  },

  updateTokenUsage: async (userId: string, month: string, tokensUsed: number) => {
    if (!supabaseAdmin) return { data: null, error: new Error('Supabase not configured') };
    const { data, error } = await supabaseAdmin
      .from('token_usage')
      .upsert({
        user_id: userId,
        month,
        tokens_used: tokensUsed,
        last_updated: new Date().toISOString()
      })
      .select()
      .single()
    return { data, error }
  },

  // Rate Limits
  getOrCreateRateLimit: async (userId: string, period: string, periodType: 'hour' | 'day') => {
    if (!supabaseAdmin) return { data: null, error: new Error('Supabase not configured') };
    // Try to get existing record
    const { data: existing, error: getError } = await supabaseAdmin
      .from('execution_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('period', period)
      .eq('period_type', periodType)
      .single()

    if (existing && !getError) {
      return { data: existing, error: null }
    }

    // Create new record if doesn't exist
    const { data, error } = await supabaseAdmin
      .from('execution_limits')
      .insert({
        user_id: userId,
        period,
        period_type: periodType,
        workflow_runs: 0,
        agent_executions: 0
      })
      .select()
      .single()

    return { data, error }
  },

  updateRateLimit: async (id: string, updates: any) => {
    if (!supabaseAdmin) return { data: null, error: new Error('Supabase not configured') };
    const { data, error } = await supabaseAdmin
      .from('execution_limits')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  }
}

// Realtime broadcasting for server-side events
export const realtimeBroadcast = {
  workflowProgress: (payload: any) => {
    if (!supabaseAdmin) return Promise.resolve();
    return supabaseAdmin
      .channel('workflow_updates')
      .send({
        type: 'broadcast',
        event: 'workflow-progress',
        payload
      })
  },

  agentStatus: (payload: any) => {
    if (!supabaseAdmin) return Promise.resolve();
    return supabaseAdmin
      .channel('workflow_updates')  
      .send({
        type: 'broadcast',
        event: 'agent-status',
        payload
      })
  },

  conductorLog: (payload: any) => {
    if (!supabaseAdmin) return Promise.resolve();
    return supabaseAdmin
      .channel('workflow_updates')
      .send({
        type: 'broadcast',
        event: 'conductor-log',
        payload
      })
  },

  tokenUsage: (payload: any) => {
    if (!supabaseAdmin) return Promise.resolve();
    return supabaseAdmin
      .channel('workflow_updates')
      .send({
        type: 'broadcast',
        event: 'token-usage',
        payload
      })
  }
}