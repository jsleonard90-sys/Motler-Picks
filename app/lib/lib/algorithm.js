import { getTodaysGames, getPitcherStats, getTeamHittingStats } from "./mlb.js";

function scorePitcherK(pitcher, oppHitting) {
  if (!pitcher || pitcher.noStats || pitcher.gamesStarted < 2) return null;

  const k9 = pitcher.k9 || 0;
  const avgK = pitcher.avgKPerStart || 0;
  const oppK = oppHitting?.kRate || 22;

  let line = Math.floor(avgK) - 0.5;
  if (line < 3.5) line = 3.5;

  let score = 0;
  if (k9 >= 11) score += 30;
  else if (k9 >= 9.5) score += 22;
  else if (k9 >= 8.2) score += 14;
  else score += 5;

  if (oppK >= 25) score += 25;
  else if (oppK >= 22) score += 15;
  else if (oppK >= 19) score += 8;

  const cushion = avgK - line;
  if (cushion >= 1.5) score += 20;
  else if (cushion >= 1) score += 12;
  else score += 5;

  const confidence = Math.min(85, Math.max(60, Math.round(58 + score * 0.35)));

  return {
    type: "STRIKEOUTS",
    line,
    direction: "OVER",
    confidence,
    score,
    reasoning: `${pitcher.name} carries a ${k9} K/9 (${pitcher.era} ERA) and averages ${avgK} Ks per start. Opponent strikes out at a ${oppK}% clip. The ${line} line sits ${cushion.toFixed(1)} below his per-start average — a comfortable cushion.`,
    keyStats: `${k9} K/9 · ${avgK} K/start avg · opp ${oppK}% K rate · ${pitcher.era} ERA`,
  };
}

export async function generateDailyPicks() {
  const games = await getTodaysGames();
  const candidates = [];

  for (const g of games) {
    if (g.status && /final|in progress|live/i.test(g.status)) continue;

    for (const side of ["home", "away"]) {
      const pitcher = g[side].probablePitcher;
      if (!pitcher) continue;
      const oppSide = side === "home" ? "away" : "home";

      const [pStats, oppHit] = await Promise.all([
        getPitcherStats(pitcher.id),
        getTeamHittingStats(g[oppSide].id),
      ]);

      const scored = scorePitcherK(pStats, oppHit);
      if (scored) {
        candidates.push({
          ...scored,
          subject: pitcher.name,
          sport: "MLB",
          team: g[side].abbr,
          game: `${g.away.abbr} @ ${g.home.abbr}`,
          gamePk: g.gamePk,
          gameTime: g.gameTime,
          confirmed: true,
        });
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  const picks = [];
  const usedGames = new Set();
  for (const c of candidates) {
    if (usedGames.has(c.gamePk)) continue;
    picks.push(c);
    usedGames.add(c.gamePk);
    if (picks.length >= 3) break;
  }

  const parlay = picks.slice(0, 2).map(p => ({
    player: p.subject,
    line: `OVER ${p.line} Strikeouts`,
    game: p.game,
  }));

  const top = picks[0];
  const ladder = top ? {
    player: top.subject,
    propType: "Strikeouts",
    game: top.game,
    rungs: [
      { label: "RUNG 1", line: (top.line).toFixed(1), note: "Safest — base line" },
      { label: "RUNG 2", line: (top.line + 1).toFixed(1), note: "Strong play" },
      { label: "RUNG 3", line: (top.line + 2).toFixed(1), note: "Demon — max payout" },
    ],
  } : null;

  return {
    date: new Date().toISOString().slice(0, 10),
    generatedAt: new Date().toISOString(),
    picks,
    parlay,
    ladder,
    note: picks.length < 3
      ? "Fewer than 3 confirmed-pitcher edges today — only posting the strong spots."
      : null,
  };
}
