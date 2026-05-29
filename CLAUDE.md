@AGENTS.md

# HeyBlue — Project Context

## What This Is
An AI-powered rules clarification tool for youth baseball umpires. Built for the Moraga Baseball Association (MBA), a Pony League affiliate. Target user: umpires ages 12–17 who need fast, authoritative rulings during live games without having to know every rule from memory.

## Owner
Brian (Moraga, CA). Built with Claude Code. Side hustle project — eventually to be monetized by selling to youth baseball leagues ($200–500/league/season). Brian has 3 years experience as MBA umpire coordinator and coached rec league baseball.

## How to Run
```bash
npm run dev        # starts at http://localhost:3000
```
- Umpire app: http://localhost:3000
- Admin panel: http://localhost:3000/admin (password set via `ADMIN_PASSWORD` in `.env.local`)

## Environment Variables (`.env.local`)
```
ANTHROPIC_API_KEY=...   # Anthropic API key for Claude
ADMIN_PASSWORD=admin    # Admin panel password
```

## Tech Stack
- **Framework:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **AI:** Claude API (`claude-sonnet-4-6`) via `@anthropic-ai/sdk`
- **Storage:** `data/leagues.json` (local JSON, MVP only — needs a real DB before production)
- **Font:** Geist (loaded in `app/layout.tsx`)

## Architecture

```
app/
  page.tsx                      # Umpire-facing app
  admin/page.tsx                # Coordinator admin panel
  api/
    ruling/route.ts             # Core AI ruling endpoint (POST)
    league/route.ts             # Public league lookup by code (GET)
    admin/
      auth/route.ts             # Password check (POST)
      leagues/route.ts          # League CRUD (GET/POST/PUT/DELETE)
      fetch-rules/route.ts      # Fetch + AI-extract rules from URL (POST)
lib/
  rules.ts                      # All hardcoded rules + getRulesForLeague()
  leagues.ts                    # CustomLeague type + JSON file I/O helpers
data/
  leagues.json                  # League storage (created at runtime)
```

## Rules System

### How Rules Are Layered (in priority order, highest first)
1. **League-specific custom rules** — stored in `data/leagues.json`, injected when umpire has an active league code
2. **MBA hardcoded custom rules** — in `lib/rules.ts` for Pinto and Mustang divisions
3. **Standard Pony League base rules** — in `lib/rules.ts`, always the foundation

### Hardcoded Rules in `lib/rules.ts`
- `PONY_BASE_RULES` — standard Pony League rules (batting, baserunning, fielding, interference, obstruction, pitching, dead ball, appeals)
- `PINTO_DIVISION_SPECIFIC` — full MBA Pinto rules (Rules #1–#20 from moragabaseball.org/pony-rules/)
- `MUSTANG_DIVISION_SPECIFIC` — full MBA Mustang rules (Rules D1–D18, E1–E10)
- `BRONCO_DIVISION_SPECIFIC` — standard Pony Bronco rules (MBA custom rules pending)
- `PONY_DIVISION_SPECIFIC` — standard Pony rules (MBA custom rules pending)

### Key Rules to Know (Common Bug Sources)
- **Count notation:** always BALLS-STRIKES. "2-1" = 2 balls, 1 strike. The prompt explicitly states this.
- **Foul bunt:** always a strike including with 2 strikes (strikeout). Regular foul ball with 2 strikes does NOT add a strike.
- **Pinto Rule #9 (overthrows):** With NO runners on base, batter-runner goes to 1B only on overthrow out of play (NOT 2B like standard rule). With runners on base, standard 2-base award applies.
- **Pinto Rule #20 (bat throwing):** Warnings are per PLAYER, not per team.
- **MBA custom rules override standard Pony rules** — both the rules text and the prompt say this explicitly.

### Source URLs
- Standard Pony rules → `https://cdn3.sportngin.com/attachments/document/f8cc-2645833/2026_PONY_Baseball_Rule_Book_Final_Proof__1_.pdf`
- MBA custom rules → `https://www.moragabaseball.org/pony-rules/`

## AI Prompt Design
- System prompt includes: rules context → source instructions → JSON format → guidelines
- Response JSON: `{ analysis, ruling, citation, ruleText, sourceUrl }`
  - `analysis` field forces the model to reason BEFORE writing the ruling (not shown in UI)
  - `ruling` must be a pure verdict — no reasoning, no "but wait", no self-correction
- JSON parse fix: strips markdown code fences before parsing (Claude sometimes wraps JSON in ` ```json ``` `)

## Umpire App (page.tsx) Key State
- `league` — active division (pony/bronco/mustang/pinto)
- `gameState` — outs, balls, strikes, runners (Base[]), inning, half
- `activeLeague` — loaded from `localStorage` on mount if a code was previously saved
- `leagueCodeInput` — input field value for entering a new code
- Game state is serialized to natural language before sending to Claude: "Top of the 3rd, 1 out, count 2-1, runner on 1st."

## Admin Panel (/admin) Flow
1. Login with password → stored in component state + used as `x-admin-password` header on all API calls
2. Create league: name + code (alphanumeric, stored uppercase) + base division
3. Edit league rules: paste text tab OR import from URL tab
   - URL import: fetches page, strips HTML, sends to Claude to extract rules, shows preview for confirmation
4. Umpires enter the league code once → saved to `localStorage` → custom rules apply to all future queries

## Competitive Landscape
- **RoboUmp AI** (roboump.app) — AI rules Q&A, but NCAA/MLB only, no youth leagues, no custom rules
- **Little League Rulebook App** — official LL app, static/no AI, Little League only
- **UmpireApp** — scheduling tool, not rules
- **Gap we fill:** youth leagues + AI reasoning + custom local rules layered on base ruleset

## Milestones
| # | Status | Description |
|---|--------|-------------|
| M1 | ✅ Done | Core Q&A — type situation, get ruling + citation with source link |
| M2 | ✅ Done | Game state panel — visual diamond, outs/count/inning selectors |
| M3 | ✅ Done | League customization — admin panel, league codes, paste or URL import |
| M4 | Not started | Voice input — speak game state and situation hands-free |
| M5 | Partial | Field UX polish — PWA, offline cache, sunlight mode, quick scenarios |
| M6 | Not started | Coordinator tools — umpire quiz, training mode, query dashboard |
| M7 | Not started | Mobile app — React Native wrapper |

## Known Gaps / Future Work
- Bronco and Pony MBA-specific custom rules not yet documented (only Pinto + Mustang from moragabaseball.org)
- `data/leagues.json` is local-only — needs Vercel KV, Supabase, or similar for production deployment
- No user authentication beyond a single admin password
- No rate limiting on the ruling API
- PWA manifest and offline caching not yet implemented (M5)
- Sunlight mode not yet implemented (M5)
