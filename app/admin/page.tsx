'use client'

import { useState, useEffect, useCallback } from 'react'
import { LEAGUE_LABELS, LeagueCode } from '@/lib/rules'
import type { CustomLeague } from '@/lib/leagues'

type View = 'login' | 'list' | 'detail'

const DIVISIONS = Object.keys(LEAGUE_LABELS) as LeagueCode[]

function authHeaders(password: string) {
  return { 'Content-Type': 'application/json', 'x-admin-password': password }
}

// ── Login ────────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (p: string) => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(false)
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    setLoading(false)
    if (res.ok) {
      onLogin(password)
    } else {
      setError(true)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-2xl mx-auto mb-4">⚾</div>
          <h1 className="text-2xl font-bold text-white">HeyBlue</h1>
          <p className="text-slate-400 text-sm mt-1">Admin Panel</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none placeholder-slate-600"
          />
          {error && <p className="text-red-400 text-sm">Incorrect password.</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white font-bold py-3 rounded-xl transition-all"
          >
            {loading ? 'Checking…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── League list ──────────────────────────────────────────────────────────────

function LeagueList({
  leagues,
  onSelect,
  onCreate,
  password,
  onDelete,
}: {
  leagues: CustomLeague[]
  onSelect: (l: CustomLeague) => void
  onCreate: (l: CustomLeague) => void
  onDelete: (id: string) => void
  password: string
}) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [division, setDivision] = useState<LeagueCode>('pony')
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError(null)
    const res = await fetch('/api/admin/leagues', {
      method: 'POST',
      headers: authHeaders(password),
      body: JSON.stringify({ name, code, baseRuleset: division }),
    })
    setCreating(false)
    if (res.ok) {
      const league = await res.json()
      onCreate(league)
      setName('')
      setCode('')
      setShowForm(false)
    } else {
      const data = await res.json()
      setError(data.error ?? 'Failed to create league')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Leagues</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
        >
          {showForm ? 'Cancel' : '+ New League'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Create League</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="League name (e.g. Moraga Baseball Association)"
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none placeholder-slate-600"
          />
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder="Code (e.g. MBA2026)"
              maxLength={12}
              className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none placeholder-slate-600 font-mono"
            />
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value as LeagueCode)}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
            >
              {DIVISIONS.map((d) => (
                <option key={d} value={d}>{LEAGUE_LABELS[d]}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={creating || !name.trim() || !code.trim()}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
          >
            {creating ? 'Creating…' : 'Create League'}
          </button>
        </form>
      )}

      {leagues.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          No leagues yet. Create one to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {leagues.map((league) => (
            <div
              key={league.id}
              className="bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-2xl p-4 cursor-pointer transition-colors group"
              onClick={() => onSelect(league)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-md">
                      {league.code}
                    </span>
                    <span className="text-[11px] text-slate-500">{LEAGUE_LABELS[league.baseRuleset]}</span>
                  </div>
                  <p className="text-white font-medium mt-1.5 text-sm">{league.name}</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {league.customRules ? `${league.customRules.split('\n').length} lines of custom rules` : 'No custom rules yet'}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(league.id) }}
                  className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all text-lg leading-none"
                  aria-label="Delete league"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── League detail ────────────────────────────────────────────────────────────

function LeagueDetail({
  league,
  password,
  onBack,
  onSaved,
}: {
  league: CustomLeague
  password: string
  onBack: () => void
  onSaved: (l: CustomLeague) => void
}) {
  const [tab, setTab] = useState<'paste' | 'url'>('paste')
  const [rulesText, setRulesText] = useState(league.customRules)
  const [urlInput, setUrlInput] = useState(league.sourceUrl ?? '')
  const [fetchedRules, setFetchedRules] = useState<string | null>(null)
  const [fetching, setFetching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function handleFetch() {
    setFetching(true)
    setFetchError(null)
    setFetchedRules(null)
    const res = await fetch('/api/admin/fetch-rules', {
      method: 'POST',
      headers: authHeaders(password),
      body: JSON.stringify({ url: urlInput }),
    })
    setFetching(false)
    if (res.ok) {
      const { rules } = await res.json()
      setFetchedRules(rules)
    } else {
      const data = await res.json()
      setFetchError(data.error ?? 'Failed to fetch rules from that URL.')
    }
  }

  function handleConfirmFetched() {
    if (fetchedRules) {
      setRulesText(fetchedRules)
      setTab('paste')
      setFetchedRules(null)
    }
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    setSaved(false)
    const res = await fetch('/api/admin/leagues', {
      method: 'PUT',
      headers: authHeaders(password),
      body: JSON.stringify({
        id: league.id,
        customRules: rulesText,
        sourceUrl: urlInput || undefined,
      }),
    })
    setSaving(false)
    if (res.ok) {
      const updated = await res.json()
      setSaved(true)
      onSaved(updated)
      setTimeout(() => setSaved(false), 2000)
    } else {
      setSaveError('Failed to save. Please try again.')
    }
  }

  return (
    <div className="space-y-4">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors text-sm">← Back</button>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-md">{league.code}</span>
            <span className="text-[11px] text-slate-500">{LEAGUE_LABELS[league.baseRuleset]}</span>
          </div>
          <p className="text-white font-semibold text-sm mt-0.5 truncate">{league.name}</p>
        </div>
      </div>

      {/* Share code */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Umpire Code</p>
        <p className="text-slate-300 text-sm mb-3">Share this code with your umpires. They enter it once when they open the app.</p>
        <div className="flex items-center gap-2">
          <span className="font-mono text-2xl font-bold text-white tracking-widest bg-slate-800 border border-slate-600 px-4 py-2 rounded-xl">
            {league.code}
          </span>
          <button
            onClick={() => navigator.clipboard.writeText(league.code)}
            className="text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-2 rounded-lg transition-colors"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Rules editor */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="flex border-b border-slate-700">
          {(['paste', 'url'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                tab === t ? 'text-white border-b-2 border-blue-500 -mb-px' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t === 'paste' ? 'Paste Rules' : 'Import from URL'}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-3">
          {tab === 'paste' ? (
            <>
              <p className="text-xs text-slate-500">
                Paste your league's custom rules below. These will be applied on top of the standard {LEAGUE_LABELS[league.baseRuleset]} rules and take priority over them.
              </p>
              <textarea
                value={rulesText}
                onChange={(e) => setRulesText(e.target.value)}
                placeholder="Paste your custom league rules here..."
                rows={12}
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 focus:border-blue-500 focus:outline-none resize-none placeholder-slate-600 font-mono leading-relaxed"
              />
            </>
          ) : (
            <>
              <p className="text-xs text-slate-500">
                Enter the URL of your league's rules page. The app will fetch and extract the rules for your review before saving.
              </p>
              <div className="flex gap-2">
                <input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://your-league.org/rules"
                  className="flex-1 bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 focus:border-blue-500 focus:outline-none placeholder-slate-600"
                />
                <button
                  onClick={handleFetch}
                  disabled={fetching || !urlInput.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
                >
                  {fetching ? 'Fetching…' : 'Fetch Rules'}
                </button>
              </div>
              {fetchError && <p className="text-red-400 text-sm">{fetchError}</p>}
              {fetching && (
                <div className="text-center py-6 text-slate-400 text-sm">
                  Fetching and extracting rules with AI…
                </div>
              )}
              {fetchedRules && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Extracted Rules — Review Before Saving</p>
                    <button
                      onClick={handleConfirmFetched}
                      className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg transition-colors font-semibold"
                    >
                      Looks good — use these ✓
                    </button>
                  </div>
                  <pre className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-xl p-3 overflow-auto max-h-64 whitespace-pre-wrap leading-relaxed">
                    {fetchedRules}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Save */}
      {saveError && <p className="text-red-400 text-sm">{saveError}</p>}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full font-bold py-3.5 rounded-xl transition-all text-sm ${
          saved
            ? 'bg-green-600 text-white'
            : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-600/25'
        }`}
      >
        {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Rules'}
      </button>

      {/* Current rules preview */}
      {league.customRules && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Currently Saved Rules</p>
          <pre className="text-slate-400 text-xs whitespace-pre-wrap leading-relaxed max-h-48 overflow-auto">
            {league.customRules}
          </pre>
        </div>
      )}
    </div>
  )
}

// ── Main admin page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [view, setView] = useState<View>('login')
  const [leagues, setLeagues] = useState<CustomLeague[]>([])
  const [selected, setSelected] = useState<CustomLeague | null>(null)

  const loadLeagues = useCallback(async (pw: string) => {
    const res = await fetch('/api/admin/leagues', { headers: { 'x-admin-password': pw } })
    if (res.ok) setLeagues(await res.json())
  }, [])

  function handleLogin(pw: string) {
    setPassword(pw)
    setView('list')
    loadLeagues(pw)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this league?')) return
    await fetch('/api/admin/leagues', {
      method: 'DELETE',
      headers: authHeaders(password),
      body: JSON.stringify({ id }),
    })
    setLeagues((prev) => prev.filter((l) => l.id !== id))
  }

  if (view === 'login') return <LoginScreen onLogin={handleLogin} />

  return (
    <main className="min-h-screen bg-slate-950 text-white" style={{ fontFamily: 'var(--font-geist-sans)' }}>
      <header className="border-b border-slate-800 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-sm">⚾</div>
            <div>
              <h1 className="text-base font-bold text-white leading-none">HeyBlue</h1>
              <p className="text-slate-400 text-[11px]">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => { setView('login'); setPassword('') }}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {view === 'list' && (
          <LeagueList
            leagues={leagues}
            password={password}
            onSelect={(l) => { setSelected(l); setView('detail') }}
            onCreate={(l) => setLeagues((prev) => [...prev, l])}
            onDelete={handleDelete}
          />
        )}
        {view === 'detail' && selected && (
          <LeagueDetail
            league={selected}
            password={password}
            onBack={() => { setView('list'); loadLeagues(password) }}
            onSaved={(updated) => {
              setSelected(updated)
              setLeagues((prev) => prev.map((l) => l.id === updated.id ? updated : l))
            }}
          />
        )}
      </div>
    </main>
  )
}
