import fs from 'fs'
import path from 'path'
import { LeagueCode } from './rules'

export type CustomLeague = {
  id: string
  code: string
  name: string
  baseRuleset: LeagueCode
  customRules: string
  sourceUrl?: string
  createdAt: string
  updatedAt: string
}

const DATA_FILE = path.join(process.cwd(), 'data', 'leagues.json')

export function readLeagues(): CustomLeague[] {
  try {
    if (!fs.existsSync(DATA_FILE)) return []
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
  } catch {
    return []
  }
}

function writeLeagues(leagues: CustomLeague[]): void {
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify(leagues, null, 2))
}

export function findLeague(code: string): CustomLeague | undefined {
  return readLeagues().find((l) => l.code.toUpperCase() === code.toUpperCase())
}

export function upsertLeague(league: CustomLeague): void {
  const leagues = readLeagues()
  const idx = leagues.findIndex((l) => l.id === league.id)
  if (idx >= 0) {
    leagues[idx] = league
  } else {
    leagues.push(league)
  }
  writeLeagues(leagues)
}

export function deleteLeague(id: string): void {
  writeLeagues(readLeagues().filter((l) => l.id !== id))
}
