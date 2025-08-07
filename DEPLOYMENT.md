# Deployment Guide

## Quick Deploy to Vercel

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Deploy the game**:
   ```bash
   npm run deploy
   ```

3. **Follow the prompts**:
   - Link to existing project or create new
   - Vercel will automatically detect Next.js settings
   - KV database will be automatically configured

## Manual Deployment Steps

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add fuel survival game with leaderboard"
   git push origin main
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Next.js and configure everything

## Environment Variables

Vercel KV will automatically configure these environment variables:
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

## Testing the Deployment

After deployment:
1. Visit your Vercel URL
2. Click "START GAME"
3. Play the game and try to get a high score
4. Check that the leaderboard persists between sessions

## Troubleshooting

- **KV Connection Issues**: Make sure Vercel KV is properly configured in your project settings
- **Build Errors**: Check that all dependencies are installed (`npm install`)
- **Leaderboard Not Working**: Verify the API routes are accessible at `/api/leaderboard`

## Local Development

For local testing with KV:
```bash
npx vercel env pull .env.local
npm run dev
``` 