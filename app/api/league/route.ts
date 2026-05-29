import { NextRequest, NextResponse } from 'next/server'
import { findLeague } from '@/lib/leagues'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'code is required' }, { status: 400 })

  const league = findLeague(code)
  if (!league) return NextResponse.json({ error: 'League not found' }, { status: 404 })

  // Don't expose internal id in the public endpoint
  const { id: _, ...public_ } = league
  return NextResponse.json(public_)
}
