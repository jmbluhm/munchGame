import { kv } from '@vercel/kv';
import type { NextApiRequest, NextApiResponse } from 'next';

interface LeaderboardEntry {
  name: string;
  score: number;
  time: number;
  speed: number;
  timestamp: number;
}

// Fallback in-memory storage for development/testing
let fallbackLeaderboard: LeaderboardEntry[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      // Get leaderboard from KV storage
      const leaderboardData = await kv.get('leaderboard');
      const leaderboard: LeaderboardEntry[] = leaderboardData ? JSON.parse(leaderboardData as string) : [];
      
      // Sort by score (highest first) and return top 10
      const sortedLeaderboard = leaderboard
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      res.status(200).json({ leaderboard: sortedLeaderboard });
    } catch (error) {
      console.error('Error fetching leaderboard from KV, using fallback:', error);
      // Use fallback storage if KV is not available
      const sortedLeaderboard = fallbackLeaderboard
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      res.status(200).json({ leaderboard: sortedLeaderboard });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, score, time, speed } = req.body;
      
      // Validate input
      if (!name || typeof score !== 'number' || typeof time !== 'number' || typeof speed !== 'number') {
        return res.status(400).json({ error: 'Invalid input data' });
      }
      
      if (name.length !== 3 || !/^[A-Z]{3}$/.test(name)) {
        return res.status(400).json({ error: 'Name must be exactly 3 uppercase letters' });
      }
      
      // Add new entry
      const newEntry: LeaderboardEntry = {
        name,
        score,
        time,
        speed,
        timestamp: Date.now()
      };
      
      try {
        // Try to use KV storage first
        const leaderboardData = await kv.get('leaderboard');
        const leaderboard: LeaderboardEntry[] = leaderboardData ? JSON.parse(leaderboardData as string) : [];
        
        leaderboard.push(newEntry);
        
        // Sort by score and keep only top 100 entries to prevent unlimited growth
        const sortedLeaderboard = leaderboard
          .sort((a, b) => b.score - a.score)
          .slice(0, 100);
        
        // Save back to KV storage
        await kv.set('leaderboard', JSON.stringify(sortedLeaderboard));
        
        res.status(200).json({ 
          success: true, 
          leaderboard: sortedLeaderboard.slice(0, 10) 
        });
      } catch (kvError) {
        console.error('KV storage failed, using fallback:', kvError);
        
        // Fallback to in-memory storage
        fallbackLeaderboard.push(newEntry);
        const sortedFallback = fallbackLeaderboard
          .sort((a, b) => b.score - a.score)
          .slice(0, 100);
        fallbackLeaderboard = sortedFallback;
        
        res.status(200).json({ 
          success: true, 
          leaderboard: sortedFallback.slice(0, 10),
          note: 'Using fallback storage (scores will reset on server restart)'
        });
      }
    } catch (error) {
      console.error('Error adding score to leaderboard:', error);
      res.status(500).json({ 
        error: 'Failed to add score to leaderboard',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 