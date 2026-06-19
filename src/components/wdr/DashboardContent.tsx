"use client";

import { useState } from "react";
import type { MoodEntryDisplay, DashboardMetrics, DashboardInsight } from "@/types";

const MOOD_LABELS  = ["CRITICAL", "BAD", "MEH", "GOOD", "GREAT"];
const MOOD_COLORS  = ["#E74C3C", "#e67e22", "#F39C12", "#27AE60", "#1e8449"];
const vt = { fontFamily: "var(--font-vt323), 'Courier New', monospace" };

function barColor(s: number) {
  if (s <= 30) return "#27AE60";
  if (s <= 60) return "#F39C12";
  if (s <= 80) return "#e67e22";
  return "#E74C3C";
}

function MiniHP({ value, max, color }: { value: number; max: number; color: string }) {
  const blocks = 10;
  const filled = Math.round((value / max) * blocks);
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {Array.from({ length: blocks }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: "10px", background: i < filled ? color : "#ccc", border: "1px solid #2C3E50" }} />
      ))}
    </div>
  );
}

function Chart({ entries }: { entries: MoodEntryDisplay[] }) {
  const data = [...entries].reverse();
  if (data.length < 2) return (
    <p style={{ ...vt, fontSize: "22px", color: "var(--text-dim)", textAlign: "center", padding: "24px" }}>
      Потрібно мінімум 2 записи для графіку
    </p>
  );

  const W = 560, H = 110, pad = 20;
  const iW = W - pad * 2, iH = H - pad * 2;
  const moodPts  = data.map((e, i) => ({ x: pad + (i / (data.length - 1)) * iW, y: pad + (1 - e.mood / 4) * iH }));
  const dmgPts   = data.map((e, i) => ({ x: pad + (i / (data.length - 1)) * iW, y: pad + (1 - e.damageScore / 100) * iH }));
  const toD = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(0)},${p.y.toFixed(0)}`).join(" ");

  return (
    <div className="space-y-2">
      <div style={{ display: "flex", gap: "20px", ...vt, fontSize: "20px", color: "var(--text-muted)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ display: "inline-block", width: "16px", height: "4px", background: "#27AE60", border: "1px solid #333" }} /> Настрій
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ display: "inline-block", width: "16px", height: "4px", background: "#E74C3C", border: "1px solid #333" }} /> Damage
        </span>
      </div>
      <div style={{ border: "4px solid #2C3E50", boxShadow: "4px 4px 0px #2C3E50", background: "#FFF8DC", overflow: "hidden" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line key={t} x1={pad} y1={pad + t * iH} x2={W - pad} y2={pad + t * iH} stroke="#ccc" strokeWidth="1" strokeDasharray="4 4" />
          ))}
          <path d={toD(dmgPts)} fill="none" stroke="#E74C3C" strokeWidth="2.5" strokeDasharray="6 3" />
          <path d={toD(moodPts)} fill="none" stroke="#27AE60" strokeWidth="2.5" />
          {moodPts.map((p, i) => (
            <rect key={i} x={p.x - 4} y={p.y - 4} width={8} height={8} fill="#27AE60" stroke="#2C3E50" strokeWidth="1" />
          ))}
        </svg>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", ...vt, fontSize: "18px", color: "var(--text-dim)" }}>
        <span>{data[0]?.createdAt}</span><span>{data[data.length - 1]?.createdAt}</span>
      </div>
    </div>
  );
}

export function DashboardContent({ entries, metrics, showWarning, meetingsCounter, insights }: {
  entries: MoodEntryDisplay[]; metrics: DashboardMetrics;
  showWarning: boolean; meetingsCounter: number; insights: DashboardInsight[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      {showWarning && (
        <div className="pixel-card" style={{ border: "4px solid #F39C12", boxShadow: "4px 4px 0px #000" }}>
          <p style={{ ...vt, fontSize: "24px", color: "#e67e22" }}>
            Важко, так? Але ти з кожним днем все ближче до зарплати.
          </p>
          <p style={{ ...vt, fontSize: "20px", color: "var(--text-muted)", marginTop: "4px" }}>3 дні поспіль поганий настрій</p>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "НАСТРІЙ",
            value: MOOD_LABELS[Math.round(metrics.avgMood)] ?? "MEH",
            sub: `${metrics.avgMood.toFixed(1)} / 4`,
            color: MOOD_COLORS[Math.round(metrics.avgMood)] ?? "#888",
            barVal: metrics.avgMood, barMax: 4,
          },
          { label: "СОН",       value: `${metrics.avgSleep.toFixed(1)}г`,       sub: "за 30 днів",   color: "#2c3e7a",                         barVal: metrics.avgSleep,       barMax: 10 },
          { label: "DAMAGE",    value: `${Math.round(metrics.avgDamageScore)}%`, sub: "навантаження", color: barColor(metrics.avgDamageScore),  barVal: metrics.avgDamageScore, barMax: 100 },
          { label: "ЗУСТРІЧІ",  value: String(meetingsCounter),                  sub: "могли бути msg",color: "#E74C3C",                        barVal: null, barMax: 0 },
        ].map((m) => (
          <div key={m.label} className="pixel-card text-center space-y-2">
            <p className="font-pixel" style={{ fontSize: "7px", color: "var(--text-muted)" }}>{m.label}</p>
            <p style={{ ...vt, fontSize: "28px", color: m.color }}>{m.value}</p>
            {m.barVal !== null && <MiniHP value={m.barVal} max={m.barMax} color={m.color} />}
            <p style={{ ...vt, fontSize: "18px", color: "var(--text-dim)" }}>{m.sub}</p>
          </div>
        ))}
      </div>

      {entries.length > 0 && (
        <div className="pixel-card space-y-3">
          <h3 className="font-pixel" style={{ fontSize: "10px", color: "#333", borderBottom: "2px solid #2C3E50", paddingBottom: "8px" }}>
            ДИНАМІКА ЗА 30 ДНІВ
          </h3>
          <Chart entries={entries} />
        </div>
      )}

      {metrics.topAnnoyances.length > 0 && (
        <div className="pixel-card space-y-4">
          <h3 className="font-pixel" style={{ fontSize: "10px", color: "#333", borderBottom: "2px solid #2C3E50", paddingBottom: "8px" }}>
            НАЙЧАСТІШІ ФАКТОРИ
          </h3>
          {metrics.topAnnoyances.slice(0, 5).map((a) => {
            const pct = Math.round((a.count / entries.length) * 100);
            const blocks = 16;
            const filled = Math.round((pct / 100) * blocks);
            return (
              <div key={a.name} className="space-y-1">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ ...vt, fontSize: "22px", color: "var(--text)" }}>{a.name}</span>
                  <span style={{ ...vt, fontSize: "20px", color: "var(--text-muted)" }}>{a.count}x</span>
                </div>
                <div style={{ display: "flex", gap: "2px" }}>
                  {Array.from({ length: blocks }).map((_, i) => (
                    <div key={i} style={{ flex: 1, height: "12px", background: i < filled ? "#E74C3C" : "#ccc", border: "1px solid #2C3E50" }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {insights.length > 0 && (
        <div className="pixel-card space-y-3">
          <h3 className="font-pixel" style={{ fontSize: "10px", color: "#333", borderBottom: "2px solid #2C3E50", paddingBottom: "8px" }}>
            AI INSIGHTS
          </h3>
          {insights.map((ins, i) => (
            <div key={i} style={{ borderLeft: "4px solid #2c3e7a", paddingLeft: "14px", ...vt, fontSize: "22px", color: "var(--text)", lineHeight: 1.5 }}>
              {ins}
            </div>
          ))}
        </div>
      )}

      {/* History */}
      <div className="pixel-card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px", borderBottom: "3px solid #2C3E50" }}>
          <h3 className="font-pixel" style={{ fontSize: "10px", color: "#333" }}>IСТОРІЯ DAMAGE REPORTS</h3>
        </div>
        {entries.length === 0 ? (
          <p style={{ ...vt, fontSize: "22px", color: "var(--text-dim)", textAlign: "center", padding: "40px 20px" }}>
            Ще немає записів. Зроби перший чекін!
          </p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} style={{ borderBottom: "2px solid #ccc" }}>
              <button
                className="w-full text-left"
                style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "14px 20px", background: "transparent", border: "none", cursor: "pointer" }}
                onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-card-2)"; }}
                onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
              >
                <span className="font-pixel" style={{ fontSize: "7px", color: MOOD_COLORS[entry.mood] ?? "#888", border: `2px solid ${MOOD_COLORS[entry.mood]}`, padding: "3px 8px", flexShrink: 0, minWidth: "76px", textAlign: "center", marginTop: "4px" }}>
                  {MOOD_LABELS[entry.mood]}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ ...vt, fontSize: "22px", color: "#1a1a1a", lineHeight: 1.4, padding: "0 0 4px 0" }}>
                    {entry.culprit}
                  </p>
                  <p style={{ ...vt, fontSize: "18px", color: "var(--text-dim)" }}>
                    {entry.createdAt}
                  </p>
                </div>
                <span style={{ ...vt, fontSize: "24px", color: barColor(entry.damageScore), flexShrink: 0 }}>
                  {entry.damageScore}%
                </span>
              </button>

              {expanded === entry.id && (
                <div style={{ padding: "12px 20px 16px", borderTop: "2px solid #ccc", background: "var(--bg-card-2)" }}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    {[["Сон", `${entry.sleepHours}г`], ["Зустрічей", String(entry.meetings)], ["Роботи", `${entry.workHours}г`], ["Стрес", entry.stressLevel]].map(([k, v]) => (
                      <div key={k} style={{ background: "var(--bg-card)", border: "2px solid var(--border)", boxShadow: "2px 2px 0px var(--border)", padding: "8px", textAlign: "center" }}>
                        <p className="font-pixel" style={{ fontSize: "7px", color: "var(--text-muted)" }}>{k}</p>
                        <p style={{ ...vt, fontSize: "22px", color: "var(--text)", marginTop: "2px" }}>{v}</p>
                      </div>
                    ))}
                  </div>
                  {entry.annoyances.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {entry.annoyances.map((a) => (
                        <span key={a} style={{ ...vt, fontSize: "18px", padding: "4px 10px", background: "var(--bg-card)", border: "2px solid #2c3e7a", color: "#2c3e7a" }}>{a}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
