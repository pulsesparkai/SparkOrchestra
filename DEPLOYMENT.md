# Orchestra Vercel Deployment Guide

## Prerequisites

1. **Supabase Project** - Make sure your Supabase project is set up and the migration has been run
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Custom Domain** - `orchestra.pulsespark.ai` configured in your DNS

## Deployment Steps

### 1. Prepare Your Repository

1. Push your Orchestra code to GitHub/GitLab/Bitbucket
2. Make sure these files are included:
   - `vercel.json` (deployment configuration)
   - `.env.example` (environment variables template)
   - `api/index.ts` (serverless function entry point)

### 2. Connect to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Orchestra repository
4. Vercel will automatically detect it as a Node.js project

### 3. Configure Environment Variables

In your Vercel project settings, add these environment variables:

**Required Supabase Variables:**
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Optional Variables:**
```
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
VITE_STRIPE_PUBLIC_KEY=pk_test_your-stripe-public-key
```

### 4. Update Supabase Settings

In your Supabase dashboard:

1. Go to **Authentication** → **Settings**
2. Update **Site URL** to: `https://orchestra.pulsespark.ai`
3. Add **Redirect URLs**:
   - `https://orchestra.pulsespark.ai/auth/callback`
   - `https://orchestra.pulsespark.ai/**` (for all auth redirects)

### 5. Configure Custom Domain

1. In Vercel project settings, go to **Domains**
2. Add `orchestra.pulsespark.ai`
3. Configure your DNS:
   - Add CNAME record: `orchestra` → `cname.vercel-dns.com`
   - Or A record pointing to Vercel's IP addresses

### 6. Build Configuration

Vercel will automatically:
- Run `npm run build` to build the frontend
- Deploy the `/api` folder as serverless functions
- Serve static files from the build output

### 7. Deploy

1. Click **Deploy** in Vercel
2. Wait for the build to complete
3. Visit `https://orchestra.pulsespark.ai` to test

## Important Notes

### WebSocket Considerations

- WebSockets may need special handling in serverless environments
- Consider using Supabase Realtime for live updates in production
- The current WebSocket implementation works best for development

### Environment Variables

- All `VITE_` prefixed variables are included in the frontend build
- Server-only variables (like `SUPABASE_SERVICE_ROLE_KEY`) remain secure
- Never expose service role keys to the frontend

### Database Connection

- Supabase handles connection pooling automatically
- No additional database configuration needed for Vercel

### Rate Limiting

- The current rate limiting works with Supabase
- No changes needed for production deployment

## Testing Deployment

1. **Authentication**: Test magic link and password login
2. **Agent Creation**: Create and test agents
3. **Workflow Designer**: Test the visual workflow builder
4. **Rate Limits**: Verify usage displays work correctly
5. **Real-time Updates**: Check that live features function

## Troubleshooting

### Common Issues:

**Build Failures:**
- Check that all dependencies are in `package.json`
- Verify TypeScript types are correct
- Ensure environment variables are set

**Authentication Issues:**
- Verify Supabase URLs are correct in environment variables
- Check Site URL and Redirect URLs in Supabase settings

**API Errors:**
- Check serverless function logs in Vercel dashboard
- Verify database connection and migrations

### Production Considerations:

1. **Monitoring**: Set up Vercel analytics and monitoring
2. **Error Tracking**: Consider adding Sentry or similar
3. **Performance**: Monitor Core Web Vitals
4. **Security**: Review CORS settings and API security

The deployment should provide the same functionality as your development environment with improved performance and global CDN distribution.