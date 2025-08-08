# Supabase Setup Guide

## 🗄️ **Database Setup**

1. **Run the SQL script** in your Supabase SQL Editor:
   ```sql
   -- Copy and paste the contents of supabase-setup.sql
   ```

2. **Verify the table was created**:
   - Go to Table Editor in Supabase
   - You should see a `leaderboard` table with the correct structure

## 🔑 **Environment Variables**

You need to add these environment variables to your Vercel project:

1. **Get your Supabase credentials**:
   - Go to your Supabase project dashboard
   - Navigate to Settings → API
   - Copy the "Project URL" and "anon public" key

2. **Add to Vercel**:
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add these variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     ```

3. **For local development**:
   - Create a `.env.local` file in your project root
   - Add the same environment variables

## 🧪 **Testing**

1. **Deploy your changes**:
   ```bash
   git add .
   git commit -m "Add Supabase integration"
   git push origin main
   ```

2. **Test the leaderboard**:
   - Play the game and get a high score
   - Enter your initials
   - Check that the score appears in the leaderboard
   - Verify it persists between sessions

## 🔍 **Troubleshooting**

### **Common Issues**:

1. **"Failed to fetch leaderboard"**:
   - Check that environment variables are set correctly
   - Verify the table exists in Supabase
   - Check RLS policies are enabled

2. **"Failed to add score"**:
   - Ensure the insert policy is enabled
   - Check that the name is exactly 3 characters
   - Verify all required fields are present

3. **Environment variables not working**:
   - Make sure to redeploy after adding environment variables
   - Check that variable names start with `NEXT_PUBLIC_`

### **Useful Supabase Queries**:

```sql
-- Check all leaderboard entries
SELECT * FROM leaderboard ORDER BY score DESC;

-- Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'leaderboard';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'leaderboard';
```

## 🎯 **What's Different Now**

- ✅ **Persistent storage**: Scores are stored in Supabase PostgreSQL
- ✅ **Real-time updates**: Leaderboard updates immediately
- ✅ **Scalable**: Can handle thousands of scores
- ✅ **Reliable**: No more server restart resets

Your leaderboard is now production-ready! 🚀 