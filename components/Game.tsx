'use client';

import React, { useEffect, useRef, useState } from 'react';

interface GameProps {
  onGameOver: (score: number, time: number, speed: number) => void;
}

interface Dot {
  x: number;
  y: number;
  fuel: number;
  size: number;
  animationPhase: number;
  lifetime: number;
  age: number;
  warningStarted: boolean;
}

interface Explosion {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  age: number;
  duration: number;
}

export default function Game({ onGameOver }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [lastTime, setLastTime] = useState(0);
  const [player, setPlayer] = useState({
    x: 0,
    y: 0,
    fuel: 40,
    maxFuel: 200,
    direction: { x: 1, y: 0 },
    moveTimer: 0,
    baseSpeed: 300,
    speedMultiplier: 1,
    bombs: 3,
    maxBombs: 5,
    lastBombEarned: -30000
  });
  const [fuelDots, setFuelDots] = useState<Dot[]>([]);
  const [redDots, setRedDots] = useState<Dot[]>([]);
  const [bombExplosions, setBombExplosions] = useState<Explosion[]>([]);
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  const [spacePressed, setSpacePressed] = useState(false);
  const [shouldUseBomb, setShouldUseBomb] = useState(false);

  const GRID_SIZE = 20;
  const COLS = 40; // 800 / 20
  const ROWS = 30; // 600 / 20

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.code]: true }));
      
      if (e.code === 'Space' && !spacePressed) {
        setSpacePressed(true);
        setShouldUseBomb(true);
      }
      
      e.preventDefault();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.code]: false }));
      if (e.code === 'Space') {
        setSpacePressed(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [spacePressed, shouldUseBomb]);

  const generateFuelDots = () => {
    const dots = [];
    const numDots = 12 + Math.floor(Math.random() * 7);
    
    for (let i = 0; i < numDots; i++) {
      dots.push(createFuelDot());
    }
    setFuelDots(dots);
  };

  const generateRedDots = () => {
    const dots = [];
    const numDots = 3 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < numDots; i++) {
      dots.push(createRedDot());
    }
    setRedDots(dots);
  };

  const createFuelDot = (): Dot => {
    let x, y;
    do {
      x = Math.floor(Math.random() * COLS);
      y = Math.floor(Math.random() * ROWS);
    } while (isPositionOccupied(x, y));
    
    const fuelValue = 2 + Math.floor(Math.random() * 19);
    
    return {
      x,
      y,
      fuel: fuelValue,
      size: Math.max(4, fuelValue * 0.8),
      animationPhase: Math.random() * Math.PI * 2,
      lifetime: 8000 + Math.random() * 7000,
      age: 0,
      warningStarted: false
    };
  };

  const createRedDot = (): Dot => {
    let x, y;
    do {
      x = Math.floor(Math.random() * COLS);
      y = Math.floor(Math.random() * ROWS);
    } while (isPositionOccupied(x, y));
    
    const drainValue = 3 + Math.floor(Math.random() * 10);
    
    return {
      x,
      y,
      fuel: -drainValue,
      size: Math.max(4, drainValue * 0.8),
      animationPhase: Math.random() * Math.PI * 2,
      lifetime: 6000 + Math.random() * 6000,
      age: 0,
      warningStarted: false
    };
  };

  const isPositionOccupied = (x: number, y: number) => {
    if (x === player.x && y === player.y) return true;
    
    for (const dot of fuelDots) {
      if (dot.x === x && dot.y === y) return true;
    }
    
    for (const dot of redDots) {
      if (dot.x === x && dot.y === y) return true;
    }
    
    return false;
  };



  const startGame = () => {
    setGameRunning(true);
    setGameTime(0);
    setLastTime(0);
    
    setPlayer({
      x: Math.floor(COLS / 2),
      y: Math.floor(ROWS / 2),
      fuel: 40,
      maxFuel: 200,
      direction: { x: 1, y: 0 },
      moveTimer: 0,
      baseSpeed: 300,
      speedMultiplier: 1,
      bombs: 3,
      maxBombs: 5,
      lastBombEarned: -30000
    });
    
    setBombExplosions([]);
    generateFuelDots();
    generateRedDots();
  };

  const gameOver = () => {
    setGameRunning(false);
    const finalTime = gameTime;
    const finalSpeed = player.speedMultiplier;
    const score = Math.floor(finalTime * finalSpeed);
    onGameOver(score, Math.floor(finalTime), finalSpeed);
  };

  useEffect(() => {
    if (!gameRunning) return;

    const gameLoop = (timestamp: number) => {
      const deltaTime = timestamp - lastTime;
      setLastTime(timestamp);
      
      // Handle bomb usage
      if (shouldUseBomb) {
        setShouldUseBomb(false);
        // Trigger bomb usage through state
        setPlayer(prev => {
          if (prev.bombs <= 0) return prev;
          
          // Create explosion animation
          setBombExplosions(prevExplosions => [...prevExplosions, {
            x: prev.x,
            y: prev.y,
            radius: 0,
            maxRadius: 8,
            age: 0,
            duration: 800
          }]);
          
          // Calculate net fuel from all dots within blast radius
          let netFuel = 0;
          const blastRadius = 8;
          
          // Check fuel dots
          setFuelDots(prevDots => {
            const newDots = [...prevDots];
            for (let i = newDots.length - 1; i >= 0; i--) {
              const dot = newDots[i];
              const distance = Math.sqrt(
                Math.pow(dot.x - prev.x, 2) + 
                Math.pow(dot.y - prev.y, 2)
              );
              
              if (distance <= blastRadius) {
                netFuel += dot.fuel;
                newDots.splice(i, 1);
                newDots.push(createFuelDot());
              }
            }
            return newDots;
          });
          
          // Check red dots
          setRedDots(prevDots => {
            const newDots = [...prevDots];
            for (let i = newDots.length - 1; i >= 0; i--) {
              const dot = newDots[i];
              const distance = Math.sqrt(
                Math.pow(dot.x - prev.x, 2) + 
                Math.pow(dot.y - prev.y, 2)
              );
              
              if (distance <= blastRadius) {
                netFuel += dot.fuel;
                newDots.splice(i, 1);
                const progressionMultiplier = 1 + Math.floor(gameTime / 15) * 0.6;
                const replacementChance = Math.min(0.95, 0.8 + (progressionMultiplier - 1) * 0.05);
                if (Math.random() < replacementChance) {
                  newDots.push(createRedDot());
                }
              }
            }
            return newDots;
          });
          
          // Apply net fuel change
          const oldFuel = prev.fuel;
          const newFuel = Math.max(0, Math.min(prev.maxFuel, prev.fuel + netFuel));
          
          // Check if we hit max fuel and can earn a bomb
          if (newFuel === prev.maxFuel && oldFuel < prev.maxFuel) {
            const currentTime = Date.now();
            if (prev.bombs < prev.maxBombs && currentTime - prev.lastBombEarned >= 30000) {
              return { ...prev, fuel: newFuel, bombs: prev.bombs + 1, lastBombEarned: currentTime };
            }
          }
          
          return { ...prev, fuel: newFuel, bombs: prev.bombs - 1 };
        });
      }
      
      // Update game time
      setGameTime(prev => {
        const newTime = prev + deltaTime / 1000;
        
        // Update speed multiplier based on new time
        setPlayer(prevPlayer => ({
          ...prevPlayer,
          speedMultiplier: 1 + Math.floor(newTime / 15) * 0.4
        }));
        
        return newTime;
      });
      
      // Handle input
      let newDirection = player.direction;
      if (keys['KeyW'] || keys['ArrowUp']) {
        newDirection = { x: 0, y: -1 };
      } else if (keys['KeyS'] || keys['ArrowDown']) {
        newDirection = { x: 0, y: 1 };
      } else if (keys['KeyA'] || keys['ArrowLeft']) {
        newDirection = { x: -1, y: 0 };
      } else if (keys['KeyD'] || keys['ArrowRight']) {
        newDirection = { x: 1, y: 0 };
      }
      
      setPlayer(prev => ({ ...prev, direction: newDirection }));
      
      // Move player
      setPlayer(prev => {
        const newMoveTimer = prev.moveTimer + deltaTime;
        const moveSpeed = prev.baseSpeed / prev.speedMultiplier;
        
        if (newMoveTimer >= moveSpeed) {
          let newX = prev.x + prev.direction.x;
          let newY = prev.y + prev.direction.y;
          
          // Wrap around screen
          if (newX < 0) newX = COLS - 1;
          if (newX >= COLS) newX = 0;
          if (newY < 0) newY = ROWS - 1;
          if (newY >= ROWS) newY = 0;
          
          // Check for fuel dot collection
          setFuelDots(prevDots => {
            const newDots = [...prevDots];
            for (let i = newDots.length - 1; i >= 0; i--) {
              const dot = newDots[i];
              if (dot.x === newX && dot.y === newY) {
                const oldFuel = prev.fuel;
                const newFuel = Math.min(prev.maxFuel, prev.fuel + dot.fuel);
                
                // Check if we hit max fuel and can earn a bomb
                if (newFuel === prev.maxFuel && oldFuel < prev.maxFuel) {
                  const currentTime = Date.now();
                  if (prev.bombs < prev.maxBombs && currentTime - prev.lastBombEarned >= 30000) {
                    setPlayer(p => ({ ...p, bombs: p.bombs + 1, lastBombEarned: currentTime }));
                  }
                }
                
                setPlayer(p => ({ ...p, fuel: newFuel }));
                newDots.splice(i, 1);
                newDots.push(createFuelDot());
              }
            }
            return newDots;
          });
          
          // Check for red dot collection
          setRedDots(prevDots => {
            const newDots = [...prevDots];
            for (let i = newDots.length - 1; i >= 0; i--) {
              const dot = newDots[i];
              if (dot.x === newX && dot.y === newY) {
                setPlayer(p => ({ ...p, fuel: Math.max(0, p.fuel + dot.fuel) }));
                newDots.splice(i, 1);
                const progressionMultiplier = 1 + Math.floor(gameTime / 15) * 0.6;
                const replacementChance = Math.min(0.95, 0.8 + (progressionMultiplier - 1) * 0.05);
                if (Math.random() < replacementChance) {
                  newDots.push(createRedDot());
                }
              }
            }
            return newDots;
          });
          
          // Check game over
          if (prev.fuel <= 1) {
            gameOver();
            return prev;
          }
          
          return {
            ...prev,
            x: newX,
            y: newY,
            fuel: prev.fuel - 1,
            moveTimer: 0
          };
        }
        
        return { ...prev, moveTimer: newMoveTimer };
      });
      
      // Update dots
      setFuelDots(prev => {
        const newDots = prev.map(dot => ({
          ...dot,
          age: dot.age + deltaTime,
          animationPhase: dot.animationPhase + deltaTime * 0.003,
          warningStarted: dot.age + deltaTime > dot.lifetime - 2000 ? true : dot.warningStarted
        })).filter(dot => dot.age <= dot.lifetime);
        
        // Add new dots to maintain density
        while (newDots.length < 12) {
          newDots.push(createFuelDot());
        }
        
        return newDots;
      });
      
      setRedDots(prev => {
        const progressionMultiplier = 1 + Math.floor(gameTime / 15) * 0.6;
        const redDotSpawnChance = Math.min(0.003, 0.0008 * progressionMultiplier);
        const maxRedDots = Math.min(15, 4 + Math.floor(gameTime / 20));
        
        const newDots = prev.map(dot => ({
          ...dot,
          age: dot.age + deltaTime,
          animationPhase: dot.animationPhase + deltaTime * 0.004,
          warningStarted: dot.age + deltaTime > dot.lifetime - 2000 ? true : dot.warningStarted
        })).filter(dot => dot.age <= dot.lifetime);
        
        // Progressive red dot spawning
        if (Math.random() < redDotSpawnChance && newDots.length < maxRedDots) {
          newDots.push(createRedDot());
        }
        
        return newDots;
      });
      
      // Update explosions
      setBombExplosions(prev => {
        const newExplosions = prev.map(explosion => ({
          ...explosion,
          age: explosion.age + deltaTime,
          radius: explosion.maxRadius * Math.min(1, (explosion.age + deltaTime) / explosion.duration * 2)
        })).filter(explosion => explosion.age < explosion.duration);
        
        return newExplosions;
      });
      
      if (gameRunning) {
        requestAnimationFrame(gameLoop);
      }
    };
    
    requestAnimationFrame(gameLoop);
  }, [gameRunning, lastTime, keys, player, fuelDots, redDots, gameTime, shouldUseBomb, createFuelDot, createRedDot, gameOver, isPositionOccupied]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const render = () => {
      // Clear canvas
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * GRID_SIZE, 0);
        ctx.lineTo(x * GRID_SIZE, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * GRID_SIZE);
        ctx.lineTo(canvas.width, y * GRID_SIZE);
        ctx.stroke();
      }
      
      // Draw fuel dots
      fuelDots.forEach(dot => {
        drawAnimatedDot(ctx, dot, '#00ff00', '#00aa00');
      });
      
      // Draw red dots
      redDots.forEach(dot => {
        drawAnimatedDot(ctx, dot, '#ff0000', '#aa0000');
      });
      
      // Draw bomb explosions
      bombExplosions.forEach(explosion => {
        drawExplosion(ctx, explosion);
      });
      
      // Draw player
      const playerCenterX = player.x * GRID_SIZE + GRID_SIZE / 2;
      const playerCenterY = player.y * GRID_SIZE + GRID_SIZE / 2;
      
      // Player glow
      const playerGradient = ctx.createRadialGradient(playerCenterX, playerCenterY, 0, playerCenterX, playerCenterY, 15);
      playerGradient.addColorStop(0, '#ffffff');
      playerGradient.addColorStop(0.7, '#aaaaaa');
      playerGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = playerGradient;
      ctx.beginPath();
      ctx.arc(playerCenterX, playerCenterY, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Player core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(playerCenterX, playerCenterY, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Direction indicator
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playerCenterX, playerCenterY);
      ctx.lineTo(
        playerCenterX + player.direction.x * 10,
        playerCenterY + player.direction.y * 10
      );
      ctx.stroke();
    };
    
    render();
  }, [player, fuelDots, redDots, bombExplosions]);

  const drawAnimatedDot = (ctx: CanvasRenderingContext2D, dot: Dot, color: string, darkerColor: string) => {
    const centerX = dot.x * GRID_SIZE + GRID_SIZE / 2;
    const centerY = dot.y * GRID_SIZE + GRID_SIZE / 2;
    
    // Pulsing animation
    const pulseScale = 1 + Math.sin(dot.animationPhase) * 0.3;
    const currentSize = dot.size * pulseScale;
    
    // Warning animation
    let alpha = 1;
    if (dot.warningStarted) {
      alpha = 0.3 + 0.7 * (Math.sin(dot.animationPhase * 3) + 1) / 2;
    }
    
    // Glow effect
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, currentSize * 2);
    gradient.addColorStop(0, color + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
    gradient.addColorStop(0.7, darkerColor + Math.floor(alpha * 170).toString(16).padStart(2, '0'));
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, currentSize * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Core dot with rotation animation
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(dot.animationPhase * 0.5);
    
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const radius = i % 2 === 0 ? currentSize : currentSize * 0.7;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  };

  const drawExplosion = (ctx: CanvasRenderingContext2D, explosion: Explosion) => {
    const centerX = explosion.x * GRID_SIZE + GRID_SIZE / 2;
    const centerY = explosion.y * GRID_SIZE + GRID_SIZE / 2;
    
    const progress = explosion.age / explosion.duration;
    const alpha = Math.max(0, 1 - progress);
    
    const radius = explosion.radius * GRID_SIZE;
    
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
  };

  const fuelPercentage = (player.fuel / player.maxFuel) * 100;

  return (
    <div className="text-center relative">
      {gameRunning && (
        <div className="flex justify-between items-center w-[800px] mx-auto mb-5 px-5 box-border">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-green-400">FUEL:</span>
            <div className="w-[200px] h-5 border-2 border-green-400 bg-black relative ml-2.5">
              <div 
                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-200"
                style={{ width: `${fuelPercentage}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-lg">
            <span>BOMBS:</span>
            <div className="flex gap-1.5">
              {Array.from({ length: player.maxBombs }, (_, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 border-2 border-yellow-400 rounded-full bg-black relative flex items-center justify-center ${
                    i < player.bombs ? 'bg-gradient-radial from-yellow-300 to-yellow-500 shadow-lg shadow-yellow-500' : ''
                  }`}
                >
                  {i < player.bombs && <span className="text-sm">💣</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="text-lg">
            <div>Time: <span>{Math.floor(gameTime)}</span>s</div>
            <div>Speed: <span>{player.speedMultiplier.toFixed(1)}</span>x</div>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border-2 border-gray-600 bg-gray-900 block mx-auto mb-5"
      />

      <div className="mt-5 text-base opacity-80">
        Use WASD or Arrow Keys to navigate • SPACE to use bomb • Green dots add fuel • Red dots drain fuel • Survive as long as possible!
      </div>

      {!gameRunning && gameTime === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 p-10 border-2 border-green-400 rounded-lg">
          <h2 className="text-green-400 text-2xl mt-0 mb-4">FUEL SURVIVAL GAME</h2>
          <p className="mb-4 text-white">Ready to survive?</p>
          <button
            className="bg-green-400 text-black border-none py-4 px-8 text-lg font-inherit cursor-pointer mt-5 hover:bg-green-600"
            onClick={startGame}
          >
            START GAME
          </button>
        </div>
      )}

      {!gameRunning && gameTime > 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 p-10 border-2 border-red-500 rounded-lg">
          <h2 className="text-red-500 text-2xl mt-0 mb-4">Game Over!</h2>
          <p className="mb-2">You survived {Math.floor(gameTime)} seconds</p>
          <p className="mb-5">Final speed multiplier: {player.speedMultiplier.toFixed(1)}x</p>
          <button
            className="bg-green-400 text-black border-none py-4 px-8 text-lg font-inherit cursor-pointer mt-5 hover:bg-green-600"
            onClick={startGame}
          >
            Restart Game
          </button>
        </div>
      )}
    </div>
  );
} 