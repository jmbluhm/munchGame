import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase, LeaderboardEntry } from '../../utils/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      // Fetch leaderboard from Supabase, ordered by score descending, limit 10
      const { data: leaderboard, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Supabase error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
        return;
      }
      
      res.status(200).json({ leaderboard: leaderboard || [] });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
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
      
      // Add new entry to Supabase
      const { data: newEntry, error: insertError } = await supabase
        .from('leaderboard')
        .insert([
          {
            name,
            score,
            time,
            speed,
            timestamp: Date.now()
          }
        ])
        .select()
        .single();
      
      if (insertError) {
        console.error('Supabase insert error:', insertError);
        res.status(500).json({ 
          error: 'Failed to add score to leaderboard',
          details: insertError.message
        });
        return;
      }
      
      // Fetch updated leaderboard
      const { data: updatedLeaderboard, error: fetchError } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);
      
      if (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        res.status(500).json({ 
          error: 'Failed to fetch updated leaderboard',
          details: fetchError.message
        });
        return;
      }
      
      res.status(200).json({ 
        success: true, 
        leaderboard: updatedLeaderboard || []
      });
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