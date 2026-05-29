import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getRulesForLeague, LeagueCode } from '@/lib/rules'
import { findLeague } from '@/lib/leagues'

type Base = 'first' | 'second' | 'third'

type GameState = {
  outs: number
  balls: number
  strikes: number
  runners: Base[]
  inning: number
  half: 'top' | 'bottom'
}

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

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { league, situation, gameState, leagueCode } = body as {
    league: LeagueCode
    situation: string
    gameState?: GameState
    leagueCode?: string
  }

  if (!situation?.trim() || !league) {
    return NextResponse.json({ error: 'Missing situation or league' }, { status: 400 })
  }

  const { rulesText: baseRulesText, ponyRulebookUrl, mbaCustomRulesUrl, hasMbaCustomRules } = getRulesForLeague(league)

  // Append custom league rules at highest priority when a league code is active
  const customLeague = leagueCode ? findLeague(leagueCode) : null
  const rulesText = customLeague?.customRules
    ? baseRulesText + `\n\n## LEAGUE-SPECIFIC CUSTOM RULES — HIGHEST PRIORITY\nThe following rules for ${customLeague.name} override all other rules where they conflict:\n\n${customLeague.customRules}`
    : baseRulesText

  const sourceInstructions = hasMbaCustomRules
    ? `Rules in this game come from two sources:
- Standard Pony League rules → source URL: ${ponyRulebookUrl}
- MBA custom division rules (labeled "MBA CUSTOM RULES" in the ruleset) → source URL: ${mbaCustomRulesUrl}

IMPORTANT: MBA custom rules override standard Pony League rules wherever they conflict. If an MBA custom rule addresses the situation, apply it and cite it — do not fall back to the standard Pony rule.

In your response, set "sourceUrl" to the MBA URL when citing an MBA custom rule, or the Pony rulebook URL when citing a standard rule.`
    : `All rules come from the official Pony League rulebook → source URL: ${ponyRulebookUrl}

Set "sourceUrl" to that URL in your response.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: `You are an expert youth baseball rules interpreter for the Moraga Baseball Association (MBA), a Pony League affiliate. You help young umpires (ages 12–17) get fast, accurate rulings during live games.

Here are the rules in effect for this game:

${rulesText}

${sourceInstructions}

When given a situation, respond with ONLY a valid JSON object — no extra text, no markdown fences — in this exact format:
{
  "analysis": "Work through the relevant rules and game state here. Check the count (balls-strikes), outs, runners, and which rules apply. Reason step by step to reach the correct ruling before writing it.",
  "ruling": "The final ruling only — no reasoning, no corrections, no 'but wait'. One or two declarative sentences stated as a verdict: 'The batter is not out. The count moves to 2-2.' Use language a 12-year-old umpire can read aloud to a coach.",
  "citation": "Rule section name — brief title (e.g. 'Foul Bunt', 'Infield Fly Rule', 'Dropped Third Strike')",
  "ruleText": "The key rule text that applies, quoted or closely paraphrased in 40 words or fewer.",
  "sourceUrl": "The URL of the source document for the cited rule."
}

Guidelines:
- Count format is always BALLS-STRIKES. "2-1" = 2 balls, 1 strike. "0-2" = 0 balls, 2 strikes. Read the count carefully in your analysis before writing the ruling.
- Use the "analysis" field to reason; use the "ruling" field only for the final verdict.
- The "ruling" field must never contain reasoning, self-corrections, or the word "but". State the outcome and nothing else.
- Only cite rules in the ruleset provided above.
- If you truly cannot determine the ruling from the provided rules, say so in the ruling field.`,
    messages: [
      {
        role: 'user',
        content: [
          `Division: ${league.toUpperCase()}`,
          gameState ? `Game state: ${buildGameStateDescription(gameState)}` : '',
          `Situation: ${situation.trim()}`,
        ]
          .filter(Boolean)
          .join('\n\n'),
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    return NextResponse.json({ error: 'Unexpected response from AI' }, { status: 500 })
  }

  const cleaned = content.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

  try {
    const result = JSON.parse(cleaned)
    return NextResponse.json(result)
  } catch {
    console.error('Failed to parse AI response:', content.text)
    return NextResponse.json({ error: 'Failed to parse ruling response' }, { status: 500 })
  }
}
