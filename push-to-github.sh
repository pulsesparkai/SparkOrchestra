#!/bin/bash

# Script to push changes to GitHub
echo "Pushing TypeScript fixes to GitHub..."

cd /home/runner/workspace

# Configure git (if needed)
# Update these with your actual GitHub email and name
git config user.email "your-github-email@example.com"
git config user.name "Your GitHub Username"

# Add all changes
git add .

# Commit with message
git commit -m "Fix TypeScript errors for Vercel deployment - fixed storage.ts and routes/agents.ts"

# Push to GitHub
git push origin main

echo "Done! Check Vercel for new deployment."