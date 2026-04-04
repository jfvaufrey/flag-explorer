import { sql } from './db'

export interface GlobalLeaderboardEntry {
  id: number
  name: string
  score: number
  region: string
  quiz_type: string
  created_at: string
}

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS leaderboard (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      score INTEGER NOT NULL,
      region VARCHAR(100) NOT NULL,
      quiz_type VARCHAR(50) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `
}

export async function submitScore({
  name,
  score,
  region,
  quiz_type,
}: {
  name: string
  score: number
  region: string
  quiz_type: string
}) {
  await ensureTable()
  const rows = await sql`
    INSERT INTO leaderboard (name, score, region, quiz_type)
    VALUES (${name}, ${score}, ${region}, ${quiz_type})
    RETURNING *
  `
  return rows[0] as GlobalLeaderboardEntry
}

export async function getGlobalLeaderboard(): Promise<GlobalLeaderboardEntry[]> {
  await ensureTable()
  const rows = await sql`
    SELECT * FROM (
      SELECT DISTINCT ON (name) *
      FROM leaderboard
      ORDER BY name, score DESC
    ) best
    ORDER BY score DESC
    LIMIT 20
  `
  return rows as GlobalLeaderboardEntry[]
}

export async function getRegionalLeaderboard(region: string): Promise<GlobalLeaderboardEntry[]> {
  await ensureTable()
  const rows = await sql`
    SELECT * FROM (
      SELECT DISTINCT ON (name) *
      FROM leaderboard
      WHERE region = ${region}
      ORDER BY name, score DESC
    ) best
    ORDER BY score DESC
    LIMIT 20
  `
  return rows as GlobalLeaderboardEntry[]
}
