const MLB_BASE = "https://statsapi.mlb.com/api/v1";

function todayET() {
  const now = new Date();
  const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  return et.toISOString().slice(0, 10);
}

export async function getTodaysGames() {
  const date = todayET();
  const url = `${MLB_BASE}/schedule?sportId=1&date=${date}&hydrate=probablePitcher,team,linescore`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`MLB schedule fetch failed: ${res.status}`);
  const data = await res.json();

  const games = [];
  for (const dateBlock of data.dates || []) {
    for (const game of dateBlock.games || []) {
      const home = game.teams?.home;
      const away = game.teams?.away;
      games.push({
        gamePk: game.gamePk,
        status: game.status?.detailedState,
        gameTime: game.gameDate,
        venue: game.venue?.name,
        home: {
          id: home?.team?.id,
          name: home?.team?.name,
          abbr: home?.team?.abbreviation || teamAbbr(home?.team?.name),
          probablePitcher: home?.probablePitcher
            ? { id: home.probablePitcher.id, name: home.probablePitcher.fullName }
            : null,
        },
        away: {
          id: away?.team?.id,
          name: away?.team?.name,
          abbr: away?.team?.abbreviation || teamAbbr(away?.team?.name),
          probablePitcher: away?.probablePitcher
            ? { id: away.probablePitcher.id, name: away.probablePitcher.fullName }
            : null,
        },
      });
    }
  }
  return games;
}

export async function getPitcherStats(pitcherId) {
  if (!pitcherId) return null;
  const url = `${MLB_BASE}/people/${pitcherId}?hydrate=stats(group=[pitching],type=[season])`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const data = await res.json();
  const person = data.people?.[0];
  const statBlock = person?.stats?.[0]?.splits?.[0]?.stat;
  if (!statBlock) return { name: person?.fullName || "Unknown", noStats: true };

  const ip = parseFloat(statBlock.inningsPitched || "0");
  const k = statBlock.strikeOuts || 0;
  const k9 = ip > 0 ? (k / ip) * 9 : 0;

  return {
    name: person.fullName,
    era: statBlock.era,
    strikeOuts: k,
    inningsPitched: ip,
    k9: parseFloat(k9.toFixed(2)),
    whip: statBlock.whip,
    gamesStarted: statBlock.gamesStarted,
    avgKPerStart: statBlock.gamesStarted > 0 ? parseFloat((k / statBlock.gamesStarted).toFixed(1)) : 0,
  };
}

export async function getTeamHittingStats(teamId) {
  if (!teamId) return null;
  const url = `${MLB_BASE}/teams/${teamId}/stats?stats=season&group=hitting&season=${new Date().getFullYear()}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const data = await res.json();
  const stat = data.stats?.[0]?.splits?.[0]?.stat;
  if (!stat) return null;
  const ab = stat.atBats || 0;
  const k = stat.strikeOuts || 0;
  return {
    avg: stat.avg,
    ops: stat.ops,
    strikeOuts: k,
    atBats: ab,
    kRate: ab > 0 ? parseFloat(((k / (stat.plateAppearances || ab)) * 100).toFixed(1)) : 0,
  };
}

function teamAbbr(name) {
  if (!name) return "???";
  const map = {
    "Arizona Diamondbacks": "AZ", "Atlanta Braves": "ATL", "Baltimore Orioles": "BAL",
    "Boston Red Sox": "BOS", "Chicago Cubs": "CHC", "Chicago White Sox": "CWS",
    "Cincinnati Reds": "CIN", "Cleveland Guardians": "CLE", "Colorado Rockies": "COL",
    "Detroit Tigers": "DET", "Houston Astros": "HOU", "Kansas City Royals": "KC",
    "Los Angeles Angels": "LAA", "Los Angeles Dodgers": "LAD", "Miami Marlins": "MIA",
    "Milwaukee Brewers": "MIL", "Minnesota Twins": "MIN", "New York Mets": "NYM",
    "New York Yankees": "NYY", "Athletics": "ATH", "Philadelphia Phillies": "PHI",
    "Pittsburgh Pirates": "PIT", "San Diego Padres": "SD", "San Francisco Giants": "SF",
    "Seattle Mariners": "SEA", "St. Louis Cardinals": "STL", "Tampa Bay Rays": "TB",
    "Texas Rangers": "TEX", "Toronto Blue Jays": "TOR", "Washington Nationals": "WSH",
  };
  return map[name] || name.slice(0, 3).toUpperCase();
}
