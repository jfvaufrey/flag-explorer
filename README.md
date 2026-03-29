# Flag Explorer — Discover the World!

An interactive, educational web application for learning the flags of all 195 countries in the world. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Interactive Lessons** — Flip card learning with fun facts for all 195 countries, grouped by region
- **Quiz Mode** — 4 question types: flag-to-country, country-to-flag, capitals quiz, and true/false
- **Games Hub** — Three fully playable games:
  - Flag Match (memory card game with 3D flip animations)
  - Speed Round (60-second blitz to identify as many flags as possible)
  - Capital Dash (90-second capitals quiz with streak multipliers)
- **Daily Challenges** — 5 new flags every day to keep your streak alive
- **Badge System** — 12 badges to collect based on achievements
- **Leaderboard** — Compete with score charts powered by Recharts
- **Streak Tracker** — Build daily streaks with visual progress
- **World Map** — Interactive SVG world map via react-simple-maps
- **Animations** — Smooth transitions and confetti via Framer Motion + canvas-confetti
- **Local Storage** — All progress, badges, and scores saved locally, no login required

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Map:** react-simple-maps
- **Confetti:** canvas-confetti
- **Fonts:** Fredoka + Nunito via next/font/google
- **Flag Images:** flagcdn.com (all 195 countries)

## Getting Started

### Prerequisites

- Node.js 20.9+
- npm

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

Open http://localhost:3000 in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Deployment to Vercel

1. Push your code to a GitHub repository

2. Go to vercel.com and import your repository

3. Vercel will auto-detect it as a Next.js project

4. Click "Deploy" — no environment variables are required!

Or deploy with the Vercel CLI:

```bash
npm install -g vercel
vercel --prod
```

## Project Structure

```
flag-explorer/
├── app/                    # Next.js app router pages
│   ├── page.tsx            # Home page
│   ├── layout.tsx          # Root layout with NavBar
│   ├── globals.css         # Global styles + Tailwind v4 theme
│   ├── learn/[region]/     # Lesson mode (flip card learning)
│   ├── quiz/[region]/      # Quiz mode (4 question types)
│   ├── games/              # Games hub + individual games
│   ├── leaderboard/        # Leaderboard with charts
│   └── challenges/         # Daily challenges + badges
├── components/             # Reusable React components
│   ├── FlagCard.tsx        # 3D flip card with Framer Motion
│   ├── QuizQuestion.tsx    # Quiz question renderer
│   ├── WorldMap.tsx        # Interactive SVG world map
│   ├── NavBar.tsx          # Navigation bar
│   ├── MiniQuiz.tsx        # Checkpoint quiz (every 5 flags)
│   ├── Confetti.tsx        # canvas-confetti wrapper
│   ├── StarRating.tsx      # Animated star rating
│   ├── ProgressBar.tsx     # Animated progress bar
│   ├── GameCard.tsx        # Game selection card
│   ├── RegionCard.tsx      # Region selection card
│   └── Leaderboard.tsx     # Leaderboard table component
├── data/
│   ├── flags.ts            # All 195 countries with flags, capitals, fun facts
│   └── regions.ts          # Region definitions (10 regions)
├── lib/
│   ├── storage.ts          # localStorage helpers (progress, scores, badges)
│   └── scoring.ts          # Scoring logic, quiz generation, shuffling
└── public/                 # Static assets
```

## Countries Covered

All 195 UN-recognized countries across 7 continents:

- **Africa** — 54 countries
- **Asia** — 48 countries
- **Europe** — 44 countries
- **North America** — 23 countries
- **South America** — 12 countries
- **Oceania** — 14 countries
- **Antarctica** — 1 territory

## Contributing

Contributions are welcome! Some ideas:

- Add more quiz question types
- Improve the drag-and-drop Flag Puzzle game
- Add sound effects
- Add multiplayer competition
- Add more badges and achievements
- Improve accessibility

## License

MIT License — feel free to use, modify, and distribute this project!
