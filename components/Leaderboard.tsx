'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface LeaderboardEntry {
  id: number;
  name: string;
  score: number;
  time: number;
  speed: number;
  timestamp: number;
  created_at: string;
}

interface LeaderboardProps {
  currentScore: number;
  currentTime: number;
  currentSpeed: number;
  onClose: () => void;
  onSubmitScore: (name: string, score: number, time: number, speed: number) => Promise<{ success: boolean; error?: string }>;
}

export default function Leaderboard({ currentScore, currentTime, currentSpeed, onClose, onSubmitScore }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showNameInput, setShowNameInput] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [isInTopTen, setIsInTopTen] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard');
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const checkIfInTopTen = useCallback(() => {
    const sortedLeaderboard = [...leaderboard].sort((a, b) => b.score - a.score);
    const isTopTen = sortedLeaderboard.length < 10 || currentScore > sortedLeaderboard[9]?.score;
    setIsInTopTen(isTopTen);
    
    if (isTopTen) {
      setShowNameInput(true);
    }
  }, [leaderboard, currentScore]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (currentScore > 0) {
      checkIfInTopTen();
    }
  }, [currentScore, leaderboard, checkIfInTopTen]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim().length === 3) {
      setIsSubmitting(true);
      setSubmitError(null);
      
      const result = await onSubmitScore(playerName.toUpperCase(), currentScore, currentTime, currentSpeed);
      
      if (result?.success) {
        setShowNameInput(false);
        setPlayerName('');
        await fetchLeaderboard();
      } else {
        setSubmitError(result?.error || 'Failed to submit score. Please try again.');
      }
      
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Only allow letters and limit to 3 characters
    const char = e.key.toUpperCase();
    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Tab') return;
    
    if (!/^[A-Z]$/.test(char) || playerName.length >= 3) {
      e.preventDefault();
    }
  };

  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 border-2 border-green-400 rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-green-400 text-center mb-6">
          🏆 LEADERBOARD 🏆
        </h2>
        
        {showNameInput && isInTopTen ? (
          <div className="text-center">
            <p className="text-green-400 text-lg mb-4">
              NEW HIGH SCORE!
            </p>
            <p className="text-white mb-4">
              Score: {currentScore} | Time: {Math.floor(currentTime)}s | Speed: {currentSpeed.toFixed(1)}x
            </p>
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div>
                <label className="block text-green-400 text-sm mb-2">
                  ENTER YOUR INITIALS (3 LETTERS):
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                  onKeyDown={handleKeyPress}
                  maxLength={3}
                  className="w-full bg-black border-2 border-green-400 text-green-400 text-center text-2xl font-mono p-3 rounded focus:outline-none focus:border-yellow-400"
                  autoFocus
                  onFocus={(e) => e.target.select()}
                />
              </div>
              {submitError && (
                <div className="text-red-400 text-sm text-center mb-2">
                  {submitError}
                </div>
              )}
              <button
                type="submit"
                disabled={playerName.length !== 3 || isSubmitting}
                className="w-full bg-green-400 text-black font-bold py-3 px-6 rounded hover:bg-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT SCORE'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-white text-sm">
                Your Score: {currentScore}
              </p>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sortedLeaderboard.length === 0 ? (
                <p className="text-gray-400 text-center">No scores yet. Be the first!</p>
              ) : (
                sortedLeaderboard.slice(0, 10).map((entry, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-2 rounded ${
                      index === 0 ? 'bg-yellow-900 border border-yellow-400' :
                      index === 1 ? 'bg-gray-700 border border-gray-400' :
                      index === 2 ? 'bg-amber-900 border border-amber-400' :
                      'bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`font-bold ${
                        index === 0 ? 'text-yellow-400' :
                        index === 1 ? 'text-gray-300' :
                        index === 2 ? 'text-amber-400' :
                        'text-green-400'
                      }`}>
                        #{index + 1}
                      </span>
                      <span className="font-mono text-white">{entry.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">{entry.score}</div>
                      <div className="text-xs text-gray-400">
                        {Math.floor(entry.time)}s @ {entry.speed.toFixed(1)}x
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <button
              onClick={onClose}
              className="w-full bg-green-400 text-black font-bold py-3 px-6 rounded hover:bg-green-300"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 