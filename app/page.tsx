'use client'

import { useState, useEffect } from 'react'
import { LEAGUE_LABELS, LeagueCode } from '@/lib/rules'
import { useVoiceInput } from '@/lib/useVoiceInput'

type LeagueInfo = {
  code: string
  name: string
  baseRuleset: LeagueCode
  customRules: string
}

type Ruling = {
  ruling: string
  citation: string
  ruleText: string
  sourceUrl?: string
}

type Base = 'first' | 'second' | 'third'

type GameState = {
  outs: number
  balls: number
  strikes: number
  runners: Base[]
  inning: number
  half: 'top' | 'bottom'
}

const DEFAULT_GAME_STATE: GameState = {
  outs: 0,
  balls: 0,
  strikes: 0,
  runners: [],
  inning: 1,
  half: 'top',
}

const LEAGUES = Object.keys(LEAGUE_LABELS) as LeagueCode[]

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0])
}

function buildGameStateDescription(gs: GameState): string {
  const parts: string[] = []
  parts.push(`${gs.half === 'top' ? 'Top' : 'Bottom'} of the ${ordinal(gs.inning)}`)
  parts.push(`${gs.outs} out${gs.outs !== 1 ? 's' : ''}`)
  parts.push(`count ${gs.balls}-${gs.strikes}`)
  if (gs.runners.length === 0) {
    parts.push('bases empty')
  } else {
    const labels = gs.runners.map((b) => ({ first: '1st', second: '2nd', third: '3rd' }[b]))
    parts.push(`runner${gs.runners.length > 1 ? 's' : ''} on ${labels.join(' and ')}`)
  }
  return parts.join(', ') + '.'
}

function toggleRunner(runners: Base[], base: Base): Base[] {
  return runners.includes(base) ? runners.filter((r) => r !== base) : [...runners, base]
}

// ── Sub-components ───────────────────────────────────────────────────────────

function DiamondBase({
  label,
  occupied,
  onClick,
}: {
  label: string
  occupied: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label}${occupied ? ' (runner on base)' : ''}`}
      className={`w-11 h-11 rotate-45 rounded-md border-2 transition-all duration-150 ${
        occupied
          ? 'bg-amber-400 border-amber-300 shadow-lg shadow-amber-400/30'
          : 'bg-slate-800 border-slate-600 hover:border-slate-400'
      }`}
    >
      <span className="-rotate-45 block text-xs font-bold">
        {occupied ? '●' : label}
      </span>
    </button>
  )
}

function CountPip({ active, color }: { active: boolean; color: string }) {
  return (
    <div
      className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
        active ? `${color} border-transparent` : 'bg-transparent border-slate-600'
      }`}
    />
  )
}

function GameStatePanel({ gs, onChange }: { gs: GameState; onChange: (gs: GameState) => void }) {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-sm p-5 space-y-5">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Game State</p>

      <div className="flex items-start gap-6">
        {/* Left column — outs, count, inning */}
        <div className="flex-1 space-y-4">
          {/* Inning */}
          <div>
            <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1.5">Inning</p>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg overflow-hidden border border-slate-700">
                {(['top', 'bottom'] as const).map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => onChange({ ...gs, half: h })}
                    className={`px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                      gs.half === h
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {h === 'top' ? '▲ Top' : '▼ Bot'}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onChange({ ...gs, inning: Math.max(1, gs.inning - 1) })}
                  className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-bold hover:bg-slate-700 transition-colors text-sm"
                >−</button>
                <span className="text-white font-bold text-base w-5 text-center">{gs.inning}</span>
                <button
                  type="button"
                  onClick={() => onChange({ ...gs, inning: Math.min(12, gs.inning + 1) })}
                  className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-bold hover:bg-slate-700 transition-colors text-sm"
                >+</button>
              </div>
            </div>
          </div>

          {/* Outs */}
          <div>
            <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1.5">Outs</p>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onChange({ ...gs, outs: n })}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-all duration-150 border ${
                    gs.outs === n
                      ? 'bg-red-500 border-red-400 text-white shadow-md shadow-red-500/30'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div>
            <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1.5">Count</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 w-6">Balls</span>
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => onChange({ ...gs, balls: n })}
                      className={`w-9 h-9 rounded-lg text-sm font-bold transition-all duration-150 border ${
                        gs.balls === n
                          ? 'bg-green-500 border-green-400 text-white shadow-md shadow-green-500/20'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 w-6">Str</span>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => onChange({ ...gs, strikes: n })}
                      className={`w-9 h-9 rounded-lg text-sm font-bold transition-all duration-150 border ${
                        gs.strikes === n
                          ? 'bg-yellow-500 border-yellow-400 text-white shadow-md shadow-yellow-500/20'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — diamond */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider">Runners</p>
          <div className="relative w-32 h-32">
            <div className="absolute top-0 left-1/2 -translate-x-1/2">
              <DiamondBase
                label="2B"
                occupied={gs.runners.includes('second')}
                onClick={() => onChange({ ...gs, runners: toggleRunner(gs.runners, 'second') })}
              />
            </div>
            <div className="absolute top-1/2 left-0 -translate-y-1/2">
              <DiamondBase
                label="3B"
                occupied={gs.runners.includes('third')}
                onClick={() => onChange({ ...gs, runners: toggleRunner(gs.runners, 'third') })}
              />
            </div>
            <div className="absolute top-1/2 right-0 -translate-y-1/2">
              <DiamondBase
                label="1B"
                occupied={gs.runners.includes('first')}
                onClick={() => onChange({ ...gs, runners: toggleRunner(gs.runners, 'first') })}
              />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              <div className="w-11 h-11 rotate-45 rounded-md border-2 border-slate-700 bg-slate-800/50 flex items-center justify-center">
                <span className="-rotate-45 text-[10px] text-slate-600 font-bold">H</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-600 text-center leading-tight">tap to toggle</p>
        </div>
      </div>

      {/* Live count preview */}
      <div className="pt-1 border-t border-slate-800">
        <p className="text-xs text-slate-500 leading-relaxed">
          {buildGameStateDescription(gs)}
        </p>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [league, setLeague] = useState<LeagueCode>('pony')
  const [gameState, setGameState] = useState<GameState>(DEFAULT_GAME_STATE)
  const [situation, setSituation] = useState('')
  const [result, setResult] = useState<Ruling | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionOpen, setSessionOpen] = useState(true)

  const { voiceState, interimText, isSupported: voiceSupported, start: startVoice, stop: stopVoice } = useVoiceInput()

  function handleVoiceResult(text: string) {
    setSituation((prev) => prev ? prev.trimEnd() + ' ' + text : text)
  }

  // League code
  const [leagueCodeInput, setLeagueCodeInput] = useState('')
  const [activeLeague, setActiveLeague] = useState<LeagueInfo | null>(null)
  const [codeError, setCodeError] = useState<string | null>(null)
  const [codeLoading, setCodeLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('umpireLeagueCode')
    if (saved) applyLeagueCode(saved, true)
  }, [])

  async function applyLeagueCode(code: string, collapse = false) {
    setCodeLoading(true)
    setCodeError(null)
    const res = await fetch(`/api/league?code=${encodeURIComponent(code)}`)
    setCodeLoading(false)
    if (res.ok) {
      const data: LeagueInfo = await res.json()
      setActiveLeague(data)
      setLeague(data.baseRuleset)
      localStorage.setItem('umpireLeagueCode', code.toUpperCase())
      if (collapse) setSessionOpen(false)
    } else {
      setCodeError('League code not found.')
      setActiveLeague(null)
    }
  }

  function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (leagueCodeInput.trim()) applyLeagueCode(leagueCodeInput.trim(), true)
  }

  function handleClearCode() {
    setActiveLeague(null)
    setLeagueCodeInput('')
    setCodeError(null)
    localStorage.removeItem('umpireLeagueCode')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!situation.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/ruling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ league, situation, gameState, leagueCode: activeLeague?.code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? 'Request failed')
      setResult(data as Ruling)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not get a ruling. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    setSituation('')
    setGameState(DEFAULT_GAME_STATE)
    setResult(null)
    setError(null)
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col" style={{ fontFamily: 'var(--font-geist-sans)' }}>
      {/* Header */}
      <header className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950" />
        <div className="relative px-5 py-5 flex items-center justify-between max-w-lg mx-auto w-full">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-sm">
                ⚾
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">HeyBlue</h1>
            </div>
            <p className="text-slate-400 text-xs mt-0.5 ml-9">MBA / Pony League · Rules Clarification</p>
          </div>
          {(result || situation) && (
            <button
              onClick={handleClear}
              className="text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-colors"
            >
              New query
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-5 space-y-4">

        {/* Session bar — collapsed */}
        {!sessionOpen && (
          <button
            onClick={() => setSessionOpen(true)}
            className="w-full flex items-center justify-between bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-2xl px-4 py-3 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest shrink-0">Game</span>
              <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                <span className="text-sm font-semibold text-white">
                  {LEAGUE_LABELS[league].split(' (')[0]}
                </span>
                <span className="text-slate-600 text-xs">
                  ({LEAGUE_LABELS[league].split(' (')[1]?.replace(')', '')})
                </span>
                {activeLeague && (
                  <>
                    <span className="text-slate-700">·</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                    <span className="text-xs font-mono text-slate-300 truncate">{activeLeague.code}</span>
                  </>
                )}
              </div>
            </div>
            <span className="text-slate-500 text-xs shrink-0 ml-2">Edit ›</span>
          </button>
        )}

        {/* Session bar — expanded */}
        {sessionOpen && (
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Game Setup</p>
              <button
                onClick={() => setSessionOpen(false)}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                Done ✓
              </button>
            </div>

            {/* Division */}
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-2">Division</p>
              <div className="grid grid-cols-4 gap-1.5">
                {LEAGUES.map((l) => {
                  const [name, ages] = LEAGUE_LABELS[l].split(' (')
                  return (
                    <button
                      key={l}
                      onClick={() => setLeague(l)}
                      className={`py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 flex flex-col items-center gap-0.5 border ${
                        league === l
                          ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/25'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                      }`}
                    >
                      <span>{name}</span>
                      <span className={`text-[10px] font-normal ${league === l ? 'text-blue-200' : 'text-slate-600'}`}>
                        {ages?.replace(')', '')}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* League code */}
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-2">
                League Code <span className="normal-case font-normal text-slate-600">(optional)</span>
              </p>
              {activeLeague ? (
                <div className="flex items-center justify-between bg-slate-800 border border-green-700/40 rounded-xl px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                    <div>
                      <p className="text-white text-sm font-semibold leading-none">{activeLeague.name}</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Custom rules active · <span className="font-mono">{activeLeague.code}</span>
                      </p>
                    </div>
                  </div>
                  <button onClick={handleClearCode} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                    Clear
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCodeSubmit} className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      value={leagueCodeInput}
                      onChange={(e) => setLeagueCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                      placeholder="e.g. MBA2026"
                      maxLength={12}
                      className="flex-1 bg-slate-800 border border-slate-700 text-white text-sm font-mono rounded-xl px-3 py-2.5 focus:border-blue-500 focus:outline-none placeholder-slate-600"
                    />
                    <button
                      type="submit"
                      disabled={codeLoading || !leagueCodeInput.trim()}
                      className="bg-slate-700 hover:bg-slate-600 disabled:opacity-40 border border-slate-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                    >
                      {codeLoading ? '…' : 'Apply'}
                    </button>
                  </div>
                  {codeError && <p className="text-red-400 text-xs">{codeError}</p>}
                </form>
              )}
            </div>
          </div>
        )}

        {/* Game state */}
        <GameStatePanel gs={gameState} onChange={setGameState} />

        {/* Situation */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">What happened?</p>
            {voiceSupported && (
              <button
                type="button"
                onClick={() => voiceState === 'listening' ? stopVoice() : startVoice(handleVoiceResult)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  voiceState === 'listening'
                    ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                    : voiceState === 'error'
                    ? 'bg-slate-800 border border-slate-700 text-red-400'
                    : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500'
                }`}
              >
                <span className={voiceState === 'listening' ? 'animate-pulse' : ''}>
                  🎙
                </span>
                {voiceState === 'listening' ? 'Stop' : voiceState === 'error' ? 'Try again' : 'Speak'}
              </button>
            )}
          </div>

          {/* Interim transcript shown while listening */}
          {voiceState === 'listening' && (
            <div className="flex items-start gap-2 bg-red-950/40 border border-red-800/40 rounded-xl px-4 py-3">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse shrink-0 mt-1.5" />
              <p className="text-slate-300 text-sm leading-relaxed min-h-[1.25rem]">
                {interimText || <span className="text-slate-500">Listening…</span>}
              </p>
            </div>
          )}

          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="Describe the play. Game state above is sent automatically."
            rows={3}
            className="w-full bg-slate-900 text-white text-base rounded-xl px-4 py-3 placeholder-slate-600 border border-slate-700 focus:border-blue-500 focus:outline-none resize-none transition-colors leading-relaxed"
          />
          <button
            type="submit"
            disabled={loading || !situation.trim()}
            className={`w-full text-white text-base font-bold py-3.5 rounded-xl transition-all duration-150 ${
              loading || !situation.trim()
                ? 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-600/30 active:scale-[0.99]'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Getting ruling…
              </span>
            ) : (
              'Get Ruling'
            )}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-red-950/60 border border-red-800/60 text-red-300 px-4 py-3 rounded-xl text-sm">
            <span className="mt-0.5 shrink-0">⚠</span>
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="rounded-2xl border border-slate-700/60 overflow-hidden shadow-xl">
            {/* Ruling */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-5 py-5">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Ruling</p>
              <p className="text-2xl font-bold text-white leading-snug">{result.ruling}</p>
            </div>

            {/* Citation */}
            <div className="bg-slate-900/80 px-5 py-4 border-t border-slate-700/60">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Rule</p>
                  <p className="text-blue-400 font-semibold text-sm">{result.citation}</p>
                  <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">{result.ruleText}</p>
                </div>
                {result.sourceUrl && (
                  <a
                    href={result.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 mt-0.5 flex items-center gap-1 text-[11px] text-slate-500 hover:text-blue-400 border border-slate-700 hover:border-blue-500/50 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Source ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
