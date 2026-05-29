import { NextRequest, NextResponse } from 'next/server'
import { readLeagues, upsertLeague, deleteLeague, CustomLeague } from '@/lib/leagues'
import { LeagueCode } from '@/lib/rules'

function isAuthed(req: NextRequest): boolean {
  return req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// List all leagues
export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return unauthorized()
  return NextResponse.json(readLeagues())
}

// Create a league
export async function POST(req: NextRequest) {
  if (!isAuthed(req)) return unauthorized()
  const { name, code, baseRuleset } = await req.json()

  if (!name?.trim() || !code?.trim() || !baseRuleset) {
    return NextResponse.json({ error: 'name, code, and baseRuleset are required' }, { status: 400 })
  }

  const existing = readLeagues().find((l) => l.code.toUpperCase() === code.toUpperCase())
  if (existing) {
    return NextResponse.json({ error: 'League code already exists' }, { status: 409 })
  }

  const league: CustomLeague = {
    id: crypto.randomUUID(),
    code: code.toUpperCase().trim(),
    name: name.trim(),
    baseRuleset: baseRuleset as LeagueCode,
    customRules: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  upsertLeague(league)
  return NextResponse.json(league, { status: 201 })
}

// Update a league (rules, name, sourceUrl)
export async function PUT(req: NextRequest) {
  if (!isAuthed(req)) return unauthorized()
  const { id, customRules, name, sourceUrl } = await req.json()

  const leagues = readLeagues()
  const league = leagues.find((l) => l.id === id)
  if (!league) return NextResponse.json({ error: 'League not found' }, { status: 404 })

  const updated: CustomLeague = {
    ...league,
    ...(name !== undefined && { name }),
    ...(customRules !== undefined && { customRules }),
    ...(sourceUrl !== undefined && { sourceUrl }),
    updatedAt: new Date().toISOString(),
  }

  upsertLeague(updated)
  return NextResponse.json(updated)
}

// Delete a league
export async function DELETE(req: NextRequest) {
  if (!isAuthed(req)) return unauthorized()
  const { id } = await req.json()
  deleteLeague(id)
  return NextResponse.json({ ok: true })
}
