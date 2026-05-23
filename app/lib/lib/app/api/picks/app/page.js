"use client";
import { useState, useEffect } from "react";

const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0a0a; --card: #141414; --border: #222;
    --accent: #e8ff47; --green: #4ade80; --red: #f87171;
    --blue: #60a5fa; --purple: #c084fc; --muted: #555; --text: #bbb; --heading: #f5f5f5;
  }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; min-height: 100vh; }
  .wrap { max-width: 440px; margin: 0 auto; padding: 20px 14px 52px; }
  .header { text-align: center; padding: 28px 0 18px; }
  .logo { font-family: 'Bebas Neue', sans-serif; font-size: 50px; letter-spacing: 6px; color: var(--heading); line-height: 1; }
  .logo .red { color: var(--red); }
  .logo em { color: var(--accent); font-style: normal; }
  .tagline { font-size: 10px; color: var(--muted); letter-spacing: 3px; margin-top: 5px; font-family: 'DM Mono', monospace; }
  .live-pill { display: inline-flex; align-items: center; gap: 6px; margin-top: 12px; padding: 5px 14px; border: 1px solid rgba(74,222,128,0.3); border-radius: 20px; font-size: 11px; color: var(--green); font-family: 'DM Mono', monospace; background: rgba(74,222,128,0.05); }
  .live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: blink 1.4s infinite; }
  @keyframes blink { 0%,100%{opacity:1}50%{opacity:.3} }
  .record-row { display: flex; gap: 8px; margin-bottom: 20px; }
  .rec-cell { flex: 1; background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 13px 8px; text-align: center; }
  .rec-val { font-family: 'Bebas Neue', sans-serif; font-size: 30px; letter-spacing: 1px; line-height: 1; }
  .rec-val.g { color: var(--green); } .rec-val.r { color: var(--red); } .rec-val.a { color: var(--accent); }
  .rec-label { font-size: 9px; color: var(--muted); letter-spacing: 1.5px; margin-top: 3px; font-family: 'DM Mono', monospace; }
  .divider { display: flex; align-items: center; gap: 10px; margin: 0 0 14px; }
  .divider-line { flex: 1; height: 1px; background: var(--border); }
  .divider-label { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 2px; color: var(--muted); white-space: nowrap; }
  .bet-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; margin-bottom: 12px; }
  .bet-card.hit { border-color: var(--green); } .bet-card.miss { border-color: var(--red); } .bet-card.void { border-color: #888; opacity: 0.85; }
  .card-stripe { height: 3px; background: linear-gradient(90deg, var(--accent), transparent); }
  .card-top { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px 0; }
  .confirmed-tag { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 1px; padding: 3px 8px; border-radius: 4px; background: rgba(74,222,128,0.12); color: var(--green); border: 1px solid rgba(74,222,128,0.25); }
  .sport-tag { font-size: 11px; color: var(--muted); font-family: 'DM Mono', monospace; }
  .player { font-family: 'Bebas Neue', sans-serif; font-size: 30px; letter-spacing: 2px; color: var(--heading); padding: 8px 14px 0; line-height: 1; }
  .game-info { font-size: 11px; color: var(--muted); padding: 3px 14px 0; font-family: 'DM Mono', monospace; }
  .line-box { margin: 10px 14px 0; padding: 12px; background: #0f0f0f; border: 1px solid var(--border); border-radius: 9px; display: flex; align-items: center; justify-content: space-between; }
  .prop-type { font-size: 9px; color: var(--muted); font-family: 'DM Mono', monospace; letter-spacing: 1px; }
  .prop-num { font-family: 'Bebas Neue', sans-serif; font-size: 30px; letter-spacing: 1px; color: var(--heading); line-height: 1; }
  .dir-badge { font-size: 11px; font-weight: 700; padding: 5px 12px; border-radius: 7px; background: rgba(74,222,128,0.12); color: var(--green); }
  .reasoning { padding: 10px 14px; font-size: 12.5px; line-height: 1.6; }
  .key-stat { margin: 0 14px 10px; padding: 7px 11px; background: rgba(232,255,71,0.06); border-left: 2px solid var(--accent); border-radius: 0 6px 6px 0; font-size: 11px; color: #999; font-family: 'DM Mono', monospace; line-height: 1.5; }
  .conf-row { padding: 0 14px 10px; display: flex; align-items: center; gap: 8px; }
  .conf-lbl { font-size: 9px; color: var(--muted); font-family: 'DM Mono', monospace; letter-spacing: 1px; }
  .conf-bar { flex: 1; height: 3px; background: #1e1e1e; border-radius: 2px; overflow: hidden; }
  .conf-fill { height: 100%; border-radius: 2px; }
  .conf-pct { font-size: 11px; font-family: 'DM Mono', monospace; }
  .btn-row { display: flex; gap: 8px; padding: 10px 14px 14px; border-top: 1px solid var(--border); }
  .rpt { flex: 1; padding: 11px; border-radius: 8px; border: 1px solid var(--border); font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; }
  .rpt-hit { background: rgba(74,222,128,0.07); color: var(--green); border-color: rgba(74,222,128,0.2); }
  .rpt-miss { background: rgba(248,113,113,0.07); color: var(--red); border-color: rgba(248,113,113,0.2); }
  .rpt-void { background: rgba(120,120,140,0.07); color: #999; }
  .settled { padding: 13px; text-align: center; font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 3px; border-top: 1px solid var(--border); }
  .settled.hit { color: var(--green); } .settled.miss { color: var(--red); } .settled.void { color: #999; }
  .loading { display: flex; flex-direction: column; align-items: center; padding: 50px 0; gap: 16px; }
  .spinner { width: 40px; height: 40px; border-radius: 50%; border: 2px solid var(--border); border-top-color: var(--accent); animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .load-txt { font-size: 13px; color: var(--muted); font-family: 'DM Mono', monospace; }
  .err { padding: 24px 16px; text-align: center; }
  .err-detail { font-size: 11px; color: #666; font-family: 'DM Mono', monospace; margin: 10px 0; word-break: break-all; }
  .btn { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid var(--border); background: var(--card); color: var(--muted); font-size: 13px; cursor: pointer; margin-bottom: 10px; font-family: 'Inter', sans-serif; }
  .btn.primary { background: rgba(232,255,71,0.1); color: var(--accent); border-color: rgba(232,255,71,0.3); }
  .disclaimer { margin-top: 24px; font-size: 10px; color: #333; text-align: center; line-height: 1.7; }
`;

function confColor(c) { return c >= 72 ? "#4ade80" : c >= 60 ? "#e8ff47" : "#f87171"; }
const STORE = "motler_real_v1";

function loadStore() {
  if (typeof window === "undefined") return { results: {} };
  try { return JSON.parse(localStorage.getItem(STORE) || '{"results":{}}'); }
  catch { return { results: {} }; }
}
function persist(s) { try { localStorage.setItem(STORE, JSON.stringify(s)); } catch {} }

function PickCard({ pick, result, onResult }) {
  const cc = confColor(pick.confidence);
  return (
    <div className={`bet-card ${result || ""}`}>
      <div className="card-stripe" />
      <div className="card-top">
        <span className="confirmed-tag">✓ CONFIRMED STARTER</span>
        <span className="sport-tag">{pick.sport}</span>
      </div>
      <div className="player">{pick.subject}</div>
      <div className="game-info">{pick.team} · {pick.game}</div>
      <div className="line-box">
        <div>
          <div className="prop-type">{pick.type}</div>
          <div className="prop-num">{pick.line}</div>
        </div>
        <div className="dir-badge">{pick.direction}</div>
      </div>
      <div className="reasoning">{pick.reasoning}</div>
      <div className="key-stat">📊 {pick.keyStats}</div>
      <div className="conf-row">
        <span className="conf-lbl">CONFIDENCE</span>
        <div className="conf-bar"><div className="conf-fill" style={{ width: `${pick.confidence}%`, background: cc }} /></div>
        <span className="conf-pct" style={{ color: cc }}>{pick.confidence}%</span>
      </div>
      {result ? (
        <div className={`settled ${result}`}>{result === "hit" ? "✅ HIT" : result === "miss" ? "❌ MISS" : "⏸ VOID"}</div>
      ) : (
        <div className="btn-row">
          <button className="rpt rpt-hit" onClick={() => onResult("hit")}>✅ Hit</button>
          <button className="rpt rpt-miss" onClick={() => onResult("miss")}>❌ Miss</button>
          <button className="rpt rpt-void" onClick={() => onResult("void")}>⏸ Void</button>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState(null);
  const [store, setStore] = useState(loadStore);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  async function fetchPicks() {
    setLoading(true); setErr(null);
    try {
      const res = await fetch("/api/picks");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e) {
      setErr(String(e.message || e));
    }
    setLoading(false);
  }

  useEffect(() => { fetchPicks(); }, []);

  function report(dayKey, idx, r) {
    const key = `${dayKey}-${idx}`;
    const results = { ...store.results, [key]: r };
    const ns = { ...store, results };
    setStore(ns); persist(ns);
  }

  const allResults = Object.values(store.results || {});
  const wins = allResults.filter(r => r === "hit").length;
  const losses = allResults.filter(r => r === "miss").length;
  const total = wins + losses;
  const pct = total > 0 ? Math.round(wins / total * 100) : null;
  const today = data?.date || new Date().toISOString().slice(0, 10);

  return (
    <>
      <style>{css}</style>
      <div className="wrap">
        <div className="header">
          <div className="logo"><span className="red">MOTLER</span> <em>PICKS</em></div>
          <div className="tagline">AUTO-GENERATED · LIVE MLB DATA</div>
          <div className="live-pill"><div className="live-dot" />CONFIRMED STARTERS ONLY</div>
        </div>
        <div className="record-row">
          <div className="rec-cell"><div className="rec-val g">{wins}</div><div className="rec-label">WINS</div></div>
          <div className="rec-cell"><div className="rec-val r">{losses}</div><div className="rec-label">LOSSES</div></div>
          <div className="rec-cell"><div className="rec-val a">{pct !== null ? `${pct}%` : "—"}</div><div className="rec-label">HIT RATE</div></div>
          <div className="rec-cell"><div className="rec-val" style={{ color: "var(--heading)" }}>{total}</div><div className="rec-label">TOTAL</div></div>
        </div>
        <div className="divider"><div className="divider-line" /><div className="divider-label">TODAY'S AUTO PICKS</div><div className="divider-line" /></div>
        {loading && <div className="loading"><div className="spinner" /><div className="load-txt">Pulling live MLB data…</div></div>}
        {!loading && err && (
          <div className="err">
            <div style={{ fontSize: 28, marginBottom: 8 }}>⚠️</div>
            <div style={{ color: "var(--heading)", fontWeight: 600 }}>Couldn't load picks</div>
            <div className="err-detail">{err}</div>
            <button className="btn primary" onClick={fetchPicks}>↻ Retry</button>
          </div>
        )}
        {!loading && !err && data && (
          <>
            {data.picks.length === 0 && (
              <div className="err"><div style={{ color: "var(--muted)" }}>No confirmed-pitcher edges found for today. Check back once lineups are posted.</div></div>
            )}
            {data.picks.map((pick, i) => (
              <PickCard key={i} pick={pick} result={store.results[`${today}-${i}`]} onResult={r => report(today, i, r)} />
            ))}
            {data.note && <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", margin: "4px 0 16px", fontFamily: "'DM Mono', monospace" }}>{data.note}</div>}
            <button className="btn" onClick={fetchPicks}>↻ Refresh Live Data</button>
          </>
        )}
        <div className="disclaimer">
          Auto-generated from live MLB Stats API · Confirmed starters only<br />
          For entertainment only · Gambling involves risk · 1-800-522-4700
        </div>
      </div>
    </>
  );
}
