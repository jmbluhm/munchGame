# Fuel Survival Game

A retro-style survival game built with Next.js and TypeScript, featuring a persistent leaderboard powered by Vercel KV.

## 🎮 Game Overview

Fuel Survival Game is a fast-paced arcade-style game where you control a ship that must navigate through a grid, collecting green fuel dots while avoiding red fuel-draining dots. The game gets progressively faster and more challenging as time goes on.

### Game Features

- **Grid-based Movement**: Navigate using WASD or arrow keys
- **Fuel Management**: Collect green dots to refuel, avoid red dots that drain fuel
- **Bomb System**: Use bombs (SPACE key) to clear areas and collect fuel from multiple dots
- **Progressive Difficulty**: Speed increases every 15 seconds
- **Persistent Leaderboard**: Global high scores stored in Vercel KV
- **Retro Styling**: Classic arcade game aesthetic with green terminal colors

### Controls

- **WASD** or **Arrow Keys**: Move the ship
- **SPACE**: Use a bomb (clears area and collects fuel from nearby dots)
- **Objective**: Survive as long as possible by managing your fuel

### Scoring System

Your final score is calculated as: `Time Survived × Speed Multiplier`

The speed multiplier increases every 15 seconds, making longer survival times exponentially more valuable.

## 🏆 Leaderboard System

The game features a classic arcade-style leaderboard where:

- Players who achieve a top 10 score can enter their 3-letter initials
- Scores are calculated as `Time × Speed Multiplier`
- Leaderboard is persistent across all players globally
- Data is stored in Vercel KV for fast, reliable access

## 🚀 Deployment

This game is designed to be deployed on Vercel with minimal configuration.

### Prerequisites

1. A Vercel account
2. Vercel KV database (automatically configured when deploying)

### Deployment Steps

1. **Fork or clone this repository**
   ```bash
   git clone <your-repo-url>
   cd fuel-survival-game
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Deploy to Vercel**
   ```bash
   npx vercel
   ```

4. **Configure Vercel KV** (if not automatically configured)
   - Go to your Vercel dashboard
   - Navigate to Storage → KV
   - Create a new KV database
   - Add the environment variables to your project

### Environment Variables

The following environment variables are automatically configured by Vercel when using Vercel KV:

- `KV_URL`: Your Vercel KV database URL
- `KV_REST_API_URL`: KV REST API URL
- `KV_REST_API_TOKEN`: KV REST API token
- `KV_REST_API_READ_ONLY_TOKEN`: KV read-only token

## 🛠️ Development

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up Vercel KV locally** (optional)
   ```bash
   npx vercel env pull .env.local
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Project Structure

```
fuel-survival-game/
├── components/
│   ├── Game.tsx          # Main game component with canvas rendering
│   └── Leaderboard.tsx   # Leaderboard display and score submission
├── pages/
│   ├── api/
│   │   └── leaderboard.ts # API endpoints for leaderboard CRUD
│   └── index.tsx         # Main page with game integration
├── styles/
│   └── globals.css       # Global styles and game-specific CSS
└── public/               # Static assets
```

### Key Technologies

- **Next.js 15**: React framework with API routes
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Vercel KV**: Redis-compatible database for leaderboard persistence
- **HTML5 Canvas**: Game rendering and animations

## 🎯 Game Mechanics

### Fuel System
- Start with 40 fuel units
- Maximum fuel capacity: 200 units
- Green dots provide 2-20 fuel units
- Red dots drain 3-12 fuel units
- Game ends when fuel reaches 0

### Bomb System
- Start with 3 bombs
- Maximum capacity: 5 bombs
- Earn bombs by reaching maximum fuel
- Bombs clear an 8-cell radius around the player
- Collect fuel from all dots in the blast radius

### Difficulty Progression
- Speed increases by 0.4x every 15 seconds
- More red dots spawn as time progresses
- Red dots spawn more frequently at higher speeds
- Fuel dots have limited lifetime (8-15 seconds)

## 🎨 Styling

The game features a retro arcade aesthetic with:
- Green terminal-style color scheme
- Monospace font (Courier New)
- Glowing effects and animations
- Classic arcade-style UI elements
- Responsive design for different screen sizes

## 📱 Browser Compatibility

The game works on all modern browsers that support:
- HTML5 Canvas
- ES6+ JavaScript features
- CSS Grid and Flexbox
- Web APIs (localStorage, fetch)

## 🤝 Contributing

Feel free to contribute to this project by:
- Reporting bugs
- Suggesting new features
- Submitting pull requests
- Improving documentation

## 📄 License

This project is open source and available under the MIT License.

## 🎮 Play the Game

Once deployed, players can:
1. Navigate to your Vercel deployment URL
2. Click "START GAME" to begin
3. Use WASD or arrow keys to move
4. Collect green dots for fuel
5. Avoid red dots that drain fuel
6. Use bombs strategically to clear areas
7. Try to achieve a high score and enter the leaderboard!

---

**Happy gaming! 🚀**
