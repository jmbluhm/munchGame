import { useState } from "react";
import Game from "../components/Game";
import Leaderboard from "../components/Leaderboard";

export default function Home() {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(1);

  const handleGameOver = (score: number, time: number, speed: number) => {
    setCurrentScore(score);
    setCurrentTime(time);
    setCurrentSpeed(speed);
    setShowLeaderboard(true);
  };

  const handleSubmitScore = async (name: string, score: number, time: number, speed: number) => {
    try {
      const response = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, score, time, speed }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to submit score`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error submitting score:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  };

  const handleCloseLeaderboard = () => {
    setShowLeaderboard(false);
    setCurrentScore(0);
  };

  const handleNewGame = () => {
    setShowLeaderboard(false);
    setCurrentScore(0);
    setCurrentTime(0);
    setCurrentSpeed(1);
    // Force a re-render of the Game component by using a key
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-green-400 font-mono">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">FUEL SURVIVAL GAME</h1>
          <p className="text-lg opacity-80">Navigate, collect fuel, avoid red dots, and survive as long as possible!</p>
        </header>

        <Game onGameOver={handleGameOver} />

                 {showLeaderboard && (
           <Leaderboard
             currentScore={currentScore}
             currentTime={currentTime}
             currentSpeed={currentSpeed}
             onClose={handleCloseLeaderboard}
             onNewGame={handleNewGame}
             onSubmitScore={handleSubmitScore}
           />
         )}
      </div>
    </div>
  );
}
