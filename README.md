# Sheep Tycoon

A sheep ranching tycoon game – now playable in your browser. Build your sheep station, manage your flock, and become the most successful Sheep Tycoon in the outback.

## Features

- **Single player** – Play vs computer (AI)
- **Multiplayer** – Create or join lobbies, play with friends
- **Full game mechanics** – Roll & move, collect wool, sell sheep, buy improvements, irrigate, draw Tucker Bag and Stock Sale cards
- **Real-time updates** – Server-Sent Events for lobby and game state
- **Canvas board** – Hexagonal stations, Monopoly-style track, sheep tokens

## Tech Stack

- **Next.js 15** (App Router)
- **PostgreSQL** + Prisma
- **TailwindCSS**
- **Server-Sent Events** (real-time multiplayer)
- **Canvas API** (game board)

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and set your `DATABASE_URL`
3. Start PostgreSQL and run: `npm run db:push`
4. Run dev server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Database

Requires PostgreSQL. Update `DATABASE_URL` in `.env`:

```
DATABASE_URL="postgresql://user:password@localhost:5432/sheep-tycoon"
```

Then run `npm run db:push` to create tables.

## Scripts

- `npm run dev` – Start development server
- `npm run build` – Build for production
- `npm run start` – Start production server
- `npm run db:push` – Push schema to database
- `npm run db:generate` – Generate Prisma client
