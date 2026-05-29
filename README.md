# HeyBlue

AI-powered rules clarification for youth baseball umpires. Ask a question about a play, describe the game situation, and get an instant ruling with a specific rule citation and source link — no need to know the rulebook from memory.

Built for the Moraga Baseball Association (MBA), a Pony League affiliate, with support for custom league rules at any level.

---

## What It Does

**For umpires**
- Describe any play in plain English and get a ruling backed by a specific rule citation
- Set game state (inning, count, outs, runners) before asking — it's included automatically in every query
- Speak your question hands-free with voice input (Chrome/Safari)
- Enter a league code once to activate your league's custom local rules

**For league coordinators**
- Admin panel to create leagues, assign codes, and manage custom rules
- Import rules directly from a URL or paste them in manually — Claude extracts and structures them
- Umpires use the league code to activate custom rules on any device

**Field mode**
- One-tap switch to a high-contrast light theme readable in direct sunlight

---

## Divisions Supported

| Division | Ages | Ruleset |
|----------|------|---------|
| Pinto | 7–8 | MBA custom rules (full) |
| Mustang | 9–10 | MBA custom rules (full) |
| Bronco | 11–12 | Standard Pony base rules |
| Pony | 13–14 | Standard Pony base rules |

---

## Tech Stack

- **Framework:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **AI:** Claude API (`claude-sonnet-4-6`) via Anthropic SDK
- **Storage:** Local JSON (MVP) — swap for Vercel KV or Supabase before production
- **Voice:** Web Speech API (no additional dependencies)

---

## Running Locally

```bash
# Install dependencies
npm install

# Create .env.local
ANTHROPIC_API_KEY=your_key_here
ADMIN_PASSWORD=your_admin_password

# Start dev server
npm run dev
```

App: http://localhost:3000  
Admin: http://localhost:3000/admin

---

## How Rules Work

Rules are layered in priority order:

1. **Custom league rules** — loaded when an umpire enters a league code
2. **MBA division rules** — hardcoded for Pinto and Mustang (from moragabaseball.org)
3. **Standard Pony League base rules** — always the foundation

Custom rules override base rules. The AI is told explicitly to apply them in this order.

---

## Roadmap

| Milestone | Status | Description |
|-----------|--------|-------------|
| M1 | ✅ Done | Core Q&A — ruling + citation + source link |
| M2 | ✅ Done | Game state panel — visual diamond, outs/count/inning |
| M3 | ✅ Done | League customization — admin panel, league codes, rule import |
| M4 | ✅ Done | Voice input — speak situation hands-free |
| M5 | In progress | Field UX — field mode, mobile layout, quick scenarios |
| M6 | Not started | Coordinator tools — umpire quiz, training mode, query dashboard |
| M7 | Not started | Mobile app — React Native wrapper |
