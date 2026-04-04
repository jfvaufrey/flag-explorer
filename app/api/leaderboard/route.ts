import { NextRequest, NextResponse } from 'next/server'
import { getGlobalLeaderboard, getRegionalLeaderboard, submitScore } from '@/lib/leaderboard'

export async function GET(request: NextRequest) {
  const region = request.nextUrl.searchParams.get('region')
  const entries = region
    ? await getRegionalLeaderboard(region)
    : await getGlobalLeaderboard()
  return NextResponse.json(entries)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, score, region, quiz_type } = body

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (typeof score !== 'number') {
    return NextResponse.json({ error: 'Score must be a number' }, { status: 400 })
  }

  const entry = await submitScore({
    name: name.trim(),
    score,
    region: region ?? 'world',
    quiz_type: quiz_type ?? 'standard',
  })
  return NextResponse.json(entry, { status: 201 })
}
