import type { NextApiRequest, NextApiResponse } from 'next';

interface LeaderboardEntry {
  name: string;
  score: number;
  time: number;
  speed: number;
  timestamp: number;
}

// In-memory storage (will reset on server restart)
// In production, you'd want to use a proper database
let leaderboard: LeaderboardEntry[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      // Sort by score (highest first) and return top 10
      const sortedLeaderboard = leaderboard
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      res.status(200).json({ leaderboard: sortedLeaderboard });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(200).json({ leaderboard: [] });
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
        // Add new entry to leaderboard
        leaderboard.push(newEntry);
        
        // Sort by score and keep only top 100 entries to prevent unlimited growth
        const sortedLeaderboard = leaderboard
          .sort((a, b) => b.score - a.score)
          .slice(0, 100);
        
        // Update the leaderboard array
        leaderboard = sortedLeaderboard;
        
        res.status(200).json({ 
          success: true, 
          leaderboard: sortedLeaderboard.slice(0, 10)
        });
      } catch (error) {
        console.error('Error adding score to leaderboard:', error);
        res.status(500).json({ 
          error: 'Failed to add score to leaderboard',
          details: error instanceof Error ? error.message : 'Unknown error'
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