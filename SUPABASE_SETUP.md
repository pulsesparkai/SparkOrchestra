# Orchestra Supabase Setup Guide

This guide walks you through setting up Supabase for Orchestra's authentication and database needs.

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: Orchestra
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project" and wait for initialization (~2 minutes)

## 2. Get Your API Keys

Once your project is ready:

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy these four keys and add them to your Replit Secrets:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key
```

## 3. Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `supabase-migration.sql`
3. Click "Run" to execute the migration

This will:
- Create all necessary tables (users, agents, token_usage, execution_limits, etc.)
- Enable Row Level Security (RLS) on all tables
- Set up policies so users can only access their own data
- Create triggers for new user management
- Enable realtime subscriptions for live updates

## 4. Configure Authentication

1. Go to **Authentication** → **Settings**
2. **Site URL**: Set to your Replit app URL (e.g., `https://your-repl-name.replit.app`)
3. **Redirect URLs**: Add `https://your-repl-name.replit.app/auth/callback`
4. **Email Templates**: Customize if desired (optional)

### Enable Magic Link Authentication

1. In **Authentication** → **Settings** → **Email**
2. Make sure "Enable email confirmations" is checked
3. Magic link authentication is enabled by default

## 5. Row Level Security Policies

The migration script automatically creates these policies:

### Users Table
- Users can view and update their own profile only

### Agents Table  
- Users can create, read, update, and delete only their own agents
- Uses `auth.uid()` to match against `user_id` column

### Token Usage & Execution Limits
- Users can only see and modify their own usage data
- Automatic cleanup and reset functionality

## 6. Realtime Features

Orchestra uses Supabase Realtime for:
- Live agent status updates
- Real-time token usage tracking  
- Workflow execution progress
- Rate limit notifications

Tables enabled for realtime:
- `agents`
- `workflow_executions` 
- `token_usage`
- `execution_limits`

## 7. Testing the Setup

After adding your Supabase keys:

1. Restart your Replit application
2. Visit your app - you should see the Orchestra login page
3. Try signing up with magic link authentication
4. Check the Supabase dashboard → **Authentication** → **Users** to see your new user
5. Try creating an agent to test the full flow

## 8. Rate Limiting Features

Orchestra includes comprehensive rate limiting:

- **10 workflow runs per hour** per user
- **100 agent executions per day** per user  
- **5-second minimum delay** between workflow executions
- **Real-time UI indicators** showing current usage like "7/10 runs this hour"

## 9. BYOAPI (Bring Your Own API Key)

Users can add their own Anthropic API keys for:
- **Unlimited usage** (bypasses all rate limits)
- **Required for automated/scheduled workflows**
- **Secure AES-256-GCM encryption** for storage

## 10. Troubleshooting

### Common Issues:

**"Missing Supabase environment variables"**
- Make sure all 4 Supabase keys are added to Replit Secrets
- Restart the application after adding secrets

**"User not authenticated"**  
- Check that RLS policies are properly set up
- Verify the JWT token is being passed correctly

**Magic link not working**
- Check Site URL and Redirect URLs in Supabase Auth settings
- Make sure email service is working (check Supabase logs)

**Database connection issues**
- Verify SUPABASE_URL and SERVICE_ROLE_KEY are correct
- Check that your Supabase project is active

### Need Help?

- Check Supabase documentation: https://supabase.com/docs
- Supabase Discord community: https://discord.supabase.com
- Replit Discord: https://discord.gg/replit

## Security Notes

- **Service Role Key**: Keep this secret! It has admin access to your database
- **Anon Key**: Safe to use in frontend code, but has limited permissions
- **Row Level Security**: Ensures users can only access their own data
- **JWT Tokens**: Automatically handled by Supabase Auth

The migration to Supabase provides Orchestra with enterprise-grade authentication, real-time features, and rock-solid security through Row Level Security policies.