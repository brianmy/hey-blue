export type LeagueCode = 'pony' | 'bronco' | 'mustang' | 'pinto'

export const LEAGUE_LABELS: Record<LeagueCode, string> = {
  pony: 'Pony (13–14)',
  bronco: 'Bronco (11–12)',
  mustang: 'Mustang (9–10)',
  pinto: 'Pinto (7–8)',
}

export const SOURCES = {
  ponyRulebook: {
    label: '2026 Pony League Rulebook (PDF)',
    url: 'https://cdn3.sportngin.com/attachments/document/f8cc-2645833/2026_PONY_Baseball_Rule_Book_Final_Proof__1_.pdf',
  },
  mbaCustomRules: {
    label: 'MBA Custom Rules',
    url: 'https://www.moragabaseball.org/pony-rules/',
  },
} as const

const PONY_BASE_RULES = `
## PONY LEAGUE STANDARD RULES

### BATTING

**Strike Zone**
The area over home plate between the batter's armpits and the top of the knees when the batter assumes a natural stance.

**Count Notation**
A count is always stated as balls first, then strikes. "2-1" means 2 balls and 1 strike. "0-2" means 0 balls and 2 strikes. Never reverse this order when interpreting a count.

**Foul Ball**
A foul ball is always a strike UNLESS the batter already has two strikes, in which case a foul ball (that is not caught) does not change the count — the batter remains at two strikes and the at-bat continues.

**Foul Bunt**
A bunt attempt that results in a foul ball is always a strike regardless of the count — including when the batter already has two strikes. A foul bunt with two strikes is strike three and the batter is out.

**Foul Tip**
A batted ball that goes sharp and direct from the bat to the catcher's hands and is legally caught. It is a strike and the ball is live. On a caught foul tip on strike three, the batter is out.

**Dropped Third Strike**
If a third strike is not caught by the catcher AND first base is unoccupied (or there are two outs), the batter may attempt to reach first base. The batter is out if the ball is controlled and first base is tagged before they arrive. If first base IS occupied with fewer than two outs, the batter is out on an uncaught third strike regardless.

**Batter Interference**
If the batter interferes with the catcher's attempt to throw after a pitch, the ball is dead and the runner must return. If a batted ball hits the catcher's mitt, it is not interference unless the catcher drops the pitch as a direct result.

**Hit by Pitch**
If a pitched ball hits the batter while they are in the batter's box, the batter is awarded first base (dead ball). If the batter makes no attempt to avoid the pitch or leans into it intentionally, it is ruled a ball instead.

### BASERUNNING

**Overrunning First Base**
A batter-runner may overrun first base without liability to be put out, provided they immediately return to first. If they make an attempt to go to second, they are liable to be tagged out.

**Force Play**
A runner is forced to advance when they have no choice due to the batter becoming a runner. At a force play, the fielder needs only to touch the base while holding the ball — no tag required.

**Tag Play**
When not forced, a fielder must tag the runner with the ball (or with the glove holding the ball) to record the out.

**Running Out of Baseline**
A runner is out if they run more than 3 feet out of the direct baseline to avoid a tag — unless avoiding a fielder who is fielding a batted ball.

**Sliding Rule**
Runners approaching home plate must slide or attempt to avoid contact when a play is being made on them. Failure to do so is interference — the runner is out.

**Missed Base / Appeal**
A runner who misses a base may be called out on a proper appeal. The appeal must be made before the next pitch, before all infielders have left the diamond, or before the game ends. The fielding team must appeal by throwing to or tagging the missed base while an umpire is watching.

**Ball Out of Play**
When a thrown ball goes out of play (into a dugout, stands, or beyond a fence), all runners are awarded two bases from their position at the time of the throw. When a pitched ball goes out of play, runners advance one base.

### FIELDING

**Infield Fly Rule**
Applies when: (a) runners are on first and second, OR bases are loaded, AND (b) there are fewer than two outs, AND (c) the batter hits a fair fly ball (not a line drive or bunt) that an infielder can catch with ordinary effort.
The umpire immediately declares "Infield fly — batter is out." The batter is out regardless of whether the ball is caught. Runners may advance at their own risk. The ball remains live.

**Legal Catch**
A catch is legal when a fielder catches a batted or thrown ball with their hand or glove before it touches the ground, and retains possession. Dropping the ball while transferring to the throwing hand is NOT a legal catch.

**Fair vs. Foul Ball**
A ball is FAIR if it:
- Settles or is touched in fair territory between home and first/third base
- Bounds past first or third base while in or over fair territory
- First touches fair territory on or beyond first or third base

A ball is FOUL if it settles or is first touched in foul territory between home and first/third, or passes first or third base in foul territory. The POSITION OF THE BALL (not the fielder's feet) determines fair or foul.

### INTERFERENCE

**Runner Interference**
A runner is out if they intentionally interfere with a fielder catching a batted ball, or with any thrown ball. Ball is dead, interfering runner is out, other runners return to last base held at the time of interference.

**Double Play Interference**
If a runner interferes with a fielder completing a double play, both the interfering runner AND the batter-runner are out.

### OBSTRUCTION

**Type A — Play Being Made on Runner**
If a fielder without the ball obstructs a runner who has a play being made on them: the ball is immediately dead; the obstructed runner is awarded the base they would have reached; other runners advance only if forced.

**Type B — No Play Being Made**
If a fielder without the ball obstructs a runner on whom no play is being made: play continues; at the conclusion of the play, the umpire awards any bases the runner was denied due to the obstruction.

### PITCHING

**Balk (Pony and Bronco only)**
A balk is an illegal motion by the pitcher with at least one runner on base. Result: all runners advance one base, ball is dead. Common balks:
- Starting the pitching motion then stopping
- Failing to come to a complete stop in the set position
- Faking a throw to first base
- Dropping the ball while on the rubber
- Pitching without stepping toward the target base

**Warm-Up Pitches**
A pitcher gets up to 8 warm-up pitches (or 1 minute) at the start of each inning. A relief pitcher entering mid-inning gets reasonable time to warm up at the umpire's discretion.

**Dead Ball Situations**
The ball is immediately dead when the umpire calls "Time," a balk is committed, a batter is hit by a pitch, interference is called, or the ball goes out of play.
`

const PONY_DIVISION_SPECIFIC = `
## PONY DIVISION (Ages 13–14) — STANDARD RULES APPLY IN FULL
- 90-foot base paths, 54-foot pitching distance
- Leading off and stealing permitted at any time
- Infield fly rule: in effect
- Balk rule: in effect
- Dropped third strike: in effect
- Pitch Smart limits (ages 13–14): 85 pitches/day max
  - 1–30 pitches: 0 rest days required
  - 31–45 pitches: 1 rest day required
  - 46–60 pitches: 2 rest days required
  - 61–75 pitches: 3 rest days required
  - 76–85 pitches: 4 rest days required
- MBA-specific Pony division customizations: pending documentation
`

const BRONCO_DIVISION_SPECIFIC = `
## BRONCO DIVISION (Ages 11–12) — STANDARD RULES APPLY IN FULL
- 70-foot base paths, 48-foot pitching distance
- Leading off and stealing permitted
- Infield fly rule: in effect
- Balk rule: in effect
- Dropped third strike: in effect
- Pitch Smart limits (ages 11–12): 85 pitches/day max
  - 1–30 pitches: 0 rest days required
  - 31–45 pitches: 1 rest day required
  - 46–60 pitches: 2 rest days required
  - 61–75 pitches: 3 rest days required
  - 76–85 pitches: 4 rest days required
- MBA-specific Bronco division customizations: pending documentation
`

const MUSTANG_DIVISION_SPECIFIC = `
## MUSTANG DIVISION (Ages 9–10) — MBA CUSTOM RULES

### Field
- 60-foot base paths, 46-foot pitching distance

### Equipment
- Bats: round, max 2⅝ inch diameter, max 42 inches length; must have USSSA 1.15 BPF or USA Baseball stamp
- No metal cleats
- Mandatory batting helmets for batters, on-deck batter, runners, and baseline coaches
- Catchers must wear mask, chest protector, shin guards, and headgear; any player warming up a pitcher must wear a mask
- Catchers must use a catcher's glove at all times
- Bats must be kept in the dugout except for the on-deck batter's bat; bats may not be left against the fence

### Participation
- Entire roster bats in rotation; unlimited substitution
- All players must play a minimum of four defensive innings per game
- A pitcher removed from the mound may return to the lineup at another position but may not pitch again in the same game
- A late-arriving player is inserted at the end of the batting order
- Minimum 8 players required at game time or the game is a forfeit; if a team drops below 8 during the game due to injury or players leaving, the game continues
- Official lineup card must be presented to the opposing scorekeeper before the game

### Batting (Rule D6, D7)
- Three strikes (called or swinging) = out; the catcher does not need to catch the third strike
- No bunting. EXCEPTION: if the batter takes a full hard swing and the ball rolls slowly into fair territory, it is a live ball — not considered a bunt
- No walks; no hit batsmen

### Baserunning (Rules D1–D5, D10)
- First half of season: no leading off; runners may steal any base only after the pitch has crossed home plate
- Second half of season: leading off and stealing permitted at any time (only if agreed to by a majority of coaches before the season)
- At any point in the season, on a passed ball, a runner may attempt to steal home — but may not leave third base until the ball has crossed home plate
- Runners must slide at home plate when a play is being made; intentional collision without a slide attempt = runner is out and ejected
- Coaches may not touch players while they are on the field or running the bases
- The catcher may be in the baseline only when the catcher has possession of the ball

### Overthrows and Ball Out of Play (Rule D2)
- Runners may advance on overthrows that remain in play
- If a thrown ball goes into the dugout or otherwise out of play, all runners are awarded two bases from their position at the time of the throw

### Bench and Dugout Rules (Rules D8, D11)
- All coaches must remain by the dugout or in the coaching boxes; coaches may not be positioned behind or around the catcher or along the foul lines in the outfield
- When the team is at bat, only one player may be in the on-deck circle and must be wearing a helmet; all other players must remain in the dugout

### Bat Throwing (Rule D12)
- Unintentional bat throw: the batter receives a warning on the first offense; a second offense results in the batter being called out
- Intentional bat or helmet throw: the batter is called out immediately with no prior warning and is subject to ejection at the umpire's discretion

### Pitching (Rules E1–E10)
- No curve balls permitted at any time
- No balk rule in Mustang
- First half of season: max 2 innings (6 outs) per calendar day per pitcher
- Second half of season: max 3 innings (9 outs) per calendar day per pitcher
- Innings are calculated in thirds; a pitcher may pitch across multiple games in the same day within the daily maximum
- A pitcher removed from the mound may not pitch again in the same game
- The pitcher may bring their hand to their mouth while in the pitching circle as long as they wipe their hand before touching the pitching rubber
- Relief pitchers entering cold are allowed a minimum of 10 warm-up pitches
- Game scores and pitch counts for all pitchers must be reported to the league commissioner after each game

### Special Rules
- No infield fly rule in Mustang division
- No 10-run mercy rule in Mustang
- Official game: 6 innings or no new inning starting after two hours; if tied after two hours, one additional inning is played; if still tied, the game is recorded as a tie
- A called game is complete if 4 innings have been played, or if the home team leads after 3½ innings
`

const PINTO_DIVISION_SPECIFIC = `
## PINTO DIVISION (Ages 7–8) — MBA CUSTOM RULES (Revised April 2025)

### Field
- 60-foot base paths, 38-foot pitching distance (coach pitches)
- 150-foot home run line
- Baserunner advancement lines at 40 feet from each preceding base
- 12-foot diameter pitcher's circle

### Equipment
- Bats: USABaseball (USABat) stamped only; USSSA 1.15 BPF NOT permitted; no length or barrel restrictions
- No metal cleats
- Mandatory batting helmets for batters, on-deck batter, runners, and baseline coaches
- Catchers must wear mask, chest protector, shin guards, and headgear; any player warming up a pitcher must wear a mask
- Bats must be kept in the dugout except for the batter's and on-deck batter's bat; bats may not be left against the fence

### Participation
- Entire roster bats in rotation; unlimited defensive substitution
- 10th defensive player (roving outfielder): mandatory when both teams field 10+ players; this player must be positioned entirely on the outfield grass and may not start any pitch on the infield skin
- Sitting rules:
  - Both teams field 9 or fewer: no one sits
  - Both teams field 10: no one sits
  - One team fields 10, other fields 9: the 10-player team sits 1 different player each inning
  - One team fields 2+ more than opponent (e.g. 11 vs 9): the larger team sits 2 players each inning; no player may sit a second time until all have sat once
- Minimum 8 players required; if a team cannot field 8 players within 15 minutes of game time, the game is a forfeit; if a team drops below 8 during the game due to injury, the game continues
- Official lineup card must be presented to the opposing scorekeeper before the game

### Batting (Rules 1–5)
- Each batter receives a maximum of 6 pitches; if the batter fouls off the 6th pitch, additional pitches are awarded until the batter misses or lets one go — foul balls always extend the count
- Three swinging strikes = out; the catcher does not need to catch the third strike
- Bunting is not allowed. EXCEPTION: if the batter takes a full hard swing and the ball rolls slowly into fair territory, it is a live ball — not considered a bunt
- No walks; no hit batsmen
- No infield fly rule

### Baserunning (Rules 6–8, 12)
- No leading off and no stealing; runners may not leave their base until the ball is hit; no rolling starts
- One team warning for early-departure violations; after the warning, the runner is out
- If the umpire sees a runner miss a base, the runner is automatically called out — there is no appeal play in Pinto; the umpire must have directly observed the miss
- Runners are only required to slide at home plate if a play is being made there; intentional collision without a slide attempt = runner is out and ejected

### Rule #9 — Overthrows and Runner Advancement (OVERRIDES standard Pony overthrow rule)
- With NO runners on base: if a fielder throws to first base and the ball goes out of play, the batter-runner is awarded first base only and may NOT advance further
- With runners on base and ball stays in play: runners advance to the base they were heading to plus one additional base
- With runners on base and ball goes out of play: runners are awarded two bases from their position at the time of the throw
- A ball is out of play if it goes into the dugout, over or under the fence, or beyond the fence line extended along the first and third base lines
- If an opposing coach, player, or parent interferes with a ball in play: runners are awarded two bases forward from their position at the time of interference; this call is at the sole judgment of the umpire and is not subject to appeal

### Rule #10 — Dead Ball / Pitcher's Circle
- Play is dead when a defensive player (not the coach/pitcher) has both feet inside the pitcher's circle with control of the ball; the umpire calls "Time"
- This rule applies when the ball is hit to the infield or outfield and the batter-runner or other runner is not put out, or when defensive players are uncertain where to make the play
- Once the player-pitcher has both feet inside the circle with control of the ball, they may not leave the circle to make a play on a runner — except to field a batted ball that came into the circle
- Rule 10.2: If a fielder outside the circle is running toward a runner with a clear intent to make a play on that runner, play is NOT stopped if the fielder inadvertently runs through the circle while pursuing the runner
- Rule 10.3: If an infielder throws to a teammate in the pitcher's circle and the ball is not caught and rolls beyond the foul lines (past the 1B or 3B line), the play IS ruled dead — but only when there was a clear intent to stop play; if the uncaught ball stays in fair territory, the ball remains live

### Rule #11 — Bases Awarded When Play is Ruled Dead
- If a runner is on or past a base when play is ruled dead, they are awarded that base
- If a runner has NOT yet reached the next base and has NOT passed the 40-foot advancement line, they must return to the previous base
- Multiple runners: if the lead runner fails to reach their base or pass the 40-foot line, ALL runners behind them must also go back — even if a trailing runner has already reached their base

### Rule #13 — Defensive Player-Pitcher
- The defensive player stationed at the pitcher's position must remain inside the pitcher's circle until the ball makes contact with the bat

### Rule #17 — Coach Positioning
- All coaches must remain by the dugout or in the coaching boxes; coaches may not position themselves behind or around the catcher or along the foul lines in the outfield
- The coach pitcher may not coach runners, fielders, or batters while in the act of pitching

### Rule #20 — Bat Throwing
- Unintentional bat throw: the batter receives a warning; warnings are assessed per individual player, not per team; a second offense by the same batter results in the batter being called out
- Intentional bat or helmet throw: the batter is called out immediately with no prior warning and is subject to ejection at the umpire's discretion
- In both cases, when the batter is called out under this rule, the out is treated like a strikeout — no runners may advance

### Coach Pitching Rules (Rules 15–16)
- Coach pitcher must be positioned within the 12-foot diameter circle centered on the pitching rubber with at least one foot inside the circle before releasing the pitch
- If a batted ball hits the coach pitcher: the ball is dead, the pitch counts as a foul strike (one strike is added to the batter's count), and runners may not advance
- If a live ball (already batted) hits the coach pitcher: the ball is dead

### Scoring
- 5-run inning limit for innings 1 through 5; unlimited runs in inning 6 and beyond
- Official game: 6 innings or no new inning starting after two hours
- Ties after two hours: one additional inning only; if still tied, the game is recorded as a tie
`

export type RulesContext = {
  rulesText: string
  ponyRulebookUrl: string
  mbaCustomRulesUrl: string
  hasMbaCustomRules: boolean
}

export function getRulesForLeague(league: LeagueCode): RulesContext {
  const hasMbaCustomRules = league === 'mustang' || league === 'pinto'

  const divisionRules = {
    pony: PONY_DIVISION_SPECIFIC,
    bronco: BRONCO_DIVISION_SPECIFIC,
    mustang: MUSTANG_DIVISION_SPECIFIC,
    pinto: PINTO_DIVISION_SPECIFIC,
  }[league]

  const precedenceHeader = hasMbaCustomRules
    ? `## RULE PRIORITY\nMBA custom division rules (labeled "MBA CUSTOM RULES") override standard Pony League rules wherever they conflict. Always apply the MBA custom rule when it addresses the same situation as a standard Pony rule.\n\n`
    : ''

  return {
    rulesText: PONY_BASE_RULES + precedenceHeader + divisionRules,
    ponyRulebookUrl: SOURCES.ponyRulebook.url,
    mbaCustomRulesUrl: SOURCES.mbaCustomRules.url,
    hasMbaCustomRules,
  }
}
