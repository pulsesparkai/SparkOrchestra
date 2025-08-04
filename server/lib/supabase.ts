import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
}

// Server-side client with service role key for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database operations with admin privileges
export const adminDb = {
  // Users
  getUserById: async (userId: string) => {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  createUser: async (user: any) => {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert(user)
      .select()
      .single()
    return { data, error }
  },

  updateUser: async (userId: string, updates: any) => {
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
    const { data, error } = await supabaseAdmin
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .is('deleted_at', null)
      .single()
    return { data, error }
  },

  getUserAgents: async (userId: string) => {
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
    return supabaseAdmin
      .channel('workflow_updates')
      .send({
        type: 'broadcast',
        event: 'workflow-progress',
        payload
      })
  },

  agentStatus: (payload: any) => {
    return supabaseAdmin
      .channel('workflow_updates')  
      .send({
        type: 'broadcast',
        event: 'agent-status',
        payload
      })
  },

  conductorLog: (payload: any) => {
    return supabaseAdmin
      .channel('workflow_updates')
      .send({
        type: 'broadcast',
        event: 'conductor-log',
        payload
      })
  },

  tokenUsage: (payload: any) => {
    return supabaseAdmin
      .channel('workflow_updates')
      .send({
        type: 'broadcast',
        event: 'token-usage',
        payload
      })
  }
}