import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Auth helper functions
export const auth = {
  signUp: async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          user_plan: 'free'
        }
      }
    })
    return { data, error }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helper functions
export const db = {
  // Agents
  getAgents: async (userId: string) => {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  createAgent: async (agent: any) => {
    const { data, error } = await supabase
      .from('agents')
      .insert(agent)
      .select()
      .single()
    return { data, error }
  },

  updateAgent: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('agents')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  deleteAgent: async (id: string) => {
    const { data, error } = await supabase
      .from('agents')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    return { data, error }
  },

  // Token Usage
  getTokenUsage: async (userId: string, month: string) => {
    const { data, error } = await supabase
      .from('token_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .single()
    return { data, error }
  },

  updateTokenUsage: async (id: string, tokensUsed: number) => {
    const { data, error } = await supabase
      .from('token_usage')
      .update({ 
        tokens_used: tokensUsed,
        last_updated: new Date().toISOString()
      })
      .eq('id', id)
    return { data, error }
  },

  createTokenUsage: async (userId: string, month: string) => {
    const { data, error } = await supabase
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

  // Rate Limits
  getRateLimits: async (userId: string, period: string, periodType: 'hour' | 'day') => {
    const { data, error } = await supabase
      .from('execution_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('period', period)
      .eq('period_type', periodType)
      .single()
    return { data, error }
  },

  createRateLimit: async (userId: string, period: string, periodType: 'hour' | 'day') => {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
      .from('execution_limits')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
    return { data, error }
  }
}

// Realtime subscriptions
export const realtime = {
  subscribeToAgents: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel('agents')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agents',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  },

  subscribeToTokenUsage: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel('token_usage')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'token_usage',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  },

  subscribeToWorkflowUpdates: (callback: (payload: any) => void) => {
    return supabase
      .channel('workflow_updates')
      .on('broadcast', { event: 'workflow-progress' }, callback)
      .on('broadcast', { event: 'agent-status' }, callback)
      .on('broadcast', { event: 'conductor-log' }, callback)
      .subscribe()
  },

  broadcastWorkflowUpdate: (event: string, payload: any) => {
    return supabase
      .channel('workflow_updates')
      .send({
        type: 'broadcast',
        event,
        payload
      })
  }
}