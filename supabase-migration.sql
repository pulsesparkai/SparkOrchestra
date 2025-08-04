-- Orchestra Supabase Migration Script
-- This script sets up the database schema with Row Level Security

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_limits ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- Agents table policies
CREATE POLICY "Users can view own agents" ON agents
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own agents" ON agents
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own agents" ON agents
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own agents" ON agents
  FOR DELETE USING (auth.uid()::text = user_id);

-- Workflow executions policies
CREATE POLICY "Users can view own workflow executions" ON workflow_executions
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own workflow executions" ON workflow_executions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own workflow executions" ON workflow_executions
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Workflow execution logs policies
CREATE POLICY "Users can view own workflow logs" ON workflow_execution_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workflow_executions 
      WHERE workflow_executions.id = workflow_execution_logs.workflow_execution_id 
      AND workflow_executions.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can create own workflow logs" ON workflow_execution_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workflow_executions 
      WHERE workflow_executions.id = workflow_execution_logs.workflow_execution_id 
      AND workflow_executions.user_id = auth.uid()::text
    )
  );

-- Token usage policies
CREATE POLICY "Users can view own token usage" ON token_usage
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own token usage" ON token_usage
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own token usage" ON token_usage
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Execution limits policies
CREATE POLICY "Users can view own execution limits" ON execution_limits
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own execution limits" ON execution_limits
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own execution limits" ON execution_limits
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, email, user_plan)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'user_plan', 'free')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE agents;
ALTER PUBLICATION supabase_realtime ADD TABLE workflow_executions;
ALTER PUBLICATION supabase_realtime ADD TABLE token_usage;
ALTER PUBLICATION supabase_realtime ADD TABLE execution_limits;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_workflow_executions_user_id ON workflow_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_user_month ON token_usage(user_id, month);
CREATE INDEX IF NOT EXISTS idx_execution_limits_user_period ON execution_limits(user_id, period, period_type);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;