"use client";

import { useState } from "react";
import type { MoodEntryDisplay, DashboardMetrics, DashboardInsight } from "@/types";

const MOOD_LABELS = ["CRITICAL", "BAD", "MEH", "GOOD", "GREAT"];
const MOOD_COLORS = ["#e94560", "#ff9800", "#ffd700", "#4cca6a", "#4cca6a"];

function barColor(s: number): string {
  if (s <= 30) return "#4cca6a";
  if (s <= 60) return "#ffd700";
  if (s <= 80) return "#ff9800";
  return "#e94560";
}

/* ── Pixel line chart ────────────────────────────── */
function PixelChart({ entries }: { entries: MoodEntryDisplay[] }) {
  const data = [...entries].reverse();
  if (data.length < 2) {
    return (
      <p
        className="font-pixel text-center py-8"
        style={{ color: "var(--text-dim)", fontSize: "8px" }}
      >
        NEED 2+ ENTRIES FOR CHART
      </p>
    );
  }

  const W = 580;
  const H = 100;
  const pad = 20;
  const iW = W - pad * 2;
  const iH = H - pad * 2;

  const moodPts = data.map((e, i) => ({
    x: pad + (i / (data.length - 1)) * iW,
    y: pad + (1 - e.mood / 4) * iH,
  }));

  const dmgPts = data.map((e, i) => ({
    x: pad + (i / (data.length - 1)) * iW,
    y: pad + (1 - e.damageScore / 100) * iH,
  }));

  const toD = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(0)},${p.y.toFixed(0)}`).join(" ");

  return (
    <div className="space-y-2">
      <div
        className="flex items-center gap-6 font-pixel"
        style={{ fontSize: "7px", color: "var(--text-muted)" }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ display: "inline-block", width: "12px", height: "3px", backgroundColor: "#4cca6a" }} />
          MOOD
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ display: "inline-block", width: "12px", height: "3px", backgroundColor: "#e94560" }} />
          DAMAGE
        </span>
      </div>
      <div
        style={{
          border: "3px solid var(--border)",
          boxShadow: "4px 4px 0px #000",
          backgroundColor: "var(--bg-card-2)",
          overflow: "hidden",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line
              key={t}
              x1={pad} y1={pad + t * iH}
              x2={W - pad} y2={pad + t * iH}
              stroke="#1a1a2e" strokeWidth="2"
            />
          ))}
          <path d={toD(dmgPts)} fill="none" stroke="#e94560" strokeWidth="2" strokeDasharray="4 2" />
          <path d={toD(moodPts)} fill="none" stroke="#4cca6a" strokeWidth="2" />
          {moodPts.map((p, i) => (
            <rect key={i} x={p.x - 3} y={p.y - 3} width={6} height={6} fill="#4cca6a" />
          ))}
        </svg>
      </div>
      <div
        className="flex justify-between font-pixel"
        style={{ fontSize: "7px", color: "var(--text-dim)" }}
      >
        <span>{data[0]?.createdAt}</span>
        <span>{data[data.length - 1]?.createdAt}</span>
      </div>
    </div>
  );
}

/* ── Mini pixel HP bar ───────────────────────────── */
function MiniHPBar({ value, max, color }: { value: number; max: number; color: string }) {
  const blocks = 10;
  const filled = Math.round((value / max) * blocks);
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {Array.from({ length: blocks }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: "8px",
            backgroundColor: i < filled ? color : "#0f3460",
            border: "1px solid #000",
          }}
        />
      ))}
    </div>
  );
}

/* ── Main ────────────────────────────────────────── */
export function DashboardContent({
  entries,
  metrics,
  showWarning,
  meetingsCounter,
  insights,
}: {
  entries: MoodEntryDisplay[];
  metrics: DashboardMetrics;
  showWarning: boolean;
  meetingsCounter: number;
  insights: DashboardInsight[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      {/* Warning banner */}
      {showWarning && (
        <div
          className="pixel-card blink"
          style={{ border: "3px solid var(--yellow)", color: "var(--yellow)" }}
        >
          <p className="font-pixel" style={{ fontSize: "9px" }}>
            !! WARNING: 3 BAD DAYS IN A ROW
          </p>
          <p
            style={{
              fontFamily: "var(--font-vt323), 'Courier New', monospace",
              fontSize: "18px",
              marginTop: "6px",
            }}
          >
            Важко, так? Але ти з кожним днем все ближче до зарплати 💸
          </p>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="pixel-card text-center space-y-2">
          <p className="font-pixel" style={{ color: "var(--text-muted)", fontSize: "7px" }}>AVG MOOD</p>
          <p
            className="font-pixel"
            style={{ fontSize: "16px", color: MOOD_COLORS[Math.round(metrics.avgMood)] ?? "#eee" }}
          >
            {MOOD_LABELS[Math.round(metrics.avgMood)] ?? "MEH"}
          </p>
          <MiniHPBar value={metrics.avgMood} max={4} color={MOOD_COLORS[Math.round(metrics.avgMood)] ?? "#eee"} />
        </div>

        <div className="pixel-card text-center space-y-2">
          <p className="font-pixel" style={{ color: "var(--text-muted)", fontSize: "7px" }}>AVG SLEEP</p>
          <p className="font-pixel" style={{ fontSize: "16px", color: "var(--text)" }}>
            {metrics.avgSleep.toFixed(1)}H
          </p>
          <MiniHPBar value={metrics.avgSleep} max={10} color="#4cca6a" />
        </div>

        <div className="pixel-card text-center space-y-2">
          <p className="font-pixel" style={{ color: "var(--text-muted)", fontSize: "7px" }}>AVG DAMAGE</p>
          <p
            className="font-pixel"
            style={{ fontSize: "16px", color: barColor(metrics.avgDamageScore) }}
          >
            {Math.round(metrics.avgDamageScore)}%
          </p>
          <MiniHPBar value={metrics.avgDamageScore} max={100} color={barColor(metrics.avgDamageScore)} />
        </div>

        <div className="pixel-card text-center space-y-2">
          <p className="font-pixel" style={{ color: "var(--text-muted)", fontSize: "7px" }}>MTG→MSG</p>
          <p className="font-pixel" style={{ fontSize: "20px", color: "var(--accent)" }}>
            {meetingsCounter}
          </p>
          <p style={{ fontFamily: "var(--font-vt323)", fontSize: "14px", color: "var(--text-dim)" }}>
            could be Slack
          </p>
        </div>
      </div>

      {/* Chart */}
      {entries.length > 0 && (
        <div className="pixel-card space-y-3">
          <p className="font-pixel" style={{ color: "var(--accent)", fontSize: "8px" }}>
            &gt; PLAYER STATS (30 DAYS)
          </p>
          <PixelChart entries={entries} />
        </div>
      )}

      {/* Top annoyances */}
      {metrics.topAnnoyances.length > 0 && (
        <div className="pixel-card space-y-3">
          <p className="font-pixel" style={{ color: "var(--accent)", fontSize: "8px" }}>
            &gt; TOP DAMAGE SOURCES
          </p>
          {metrics.topAnnoyances.slice(0, 5).map((a) => {
            const pct = Math.round((a.count / entries.length) * 100);
            const blocks = 16;
            const filled = Math.round((pct / 100) * blocks);
            return (
              <div key={a.name} className="space-y-1">
                <div className="flex justify-between">
                  <span
                    style={{
                      fontFamily: "var(--font-vt323), 'Courier New', monospace",
                      fontSize: "17px",
                      color: "var(--text)",
                    }}
                  >
                    {a.name}
                  </span>
                  <span className="font-pixel" style={{ fontSize: "8px", color: "var(--text-muted)" }}>
                    {a.count}x
                  </span>
                </div>
                <div style={{ display: "flex", gap: "2px" }}>
                  {Array.from({ length: blocks }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1, height: "10px",
                        backgroundColor: i < filled ? "var(--accent)" : "#0f3460",
                        border: "1px solid #000",
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="pixel-card space-y-3">
          <p className="font-pixel" style={{ color: "var(--accent)", fontSize: "8px" }}>
            &gt; AI INTEL
          </p>
          {insights.map((insight, i) => (
            <div
              key={i}
              style={{
                borderLeft: "4px solid var(--accent)",
                paddingLeft: "12px",
                fontFamily: "var(--font-vt323), 'Courier New', monospace",
                fontSize: "18px",
                color: "var(--text)",
              }}
            >
              {insight}
            </div>
          ))}
        </div>
      )}

      {/* History */}
      <div className="pixel-card" style={{ padding: 0 }}>
        <div
          className="px-5 py-4"
          style={{ borderBottom: "3px solid var(--border)" }}
        >
          <p className="font-pixel" style={{ color: "var(--accent)", fontSize: "8px" }}>
            &gt; DAMAGE HISTORY LOG
          </p>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-10 px-5">
            <p className="font-pixel" style={{ fontSize: "8px", color: "var(--text-dim)" }}>
              NO DATA. START YOUR FIRST CHECKIN.
            </p>
          </div>
        ) : (
          <div>
            {entries.map((entry) => (
              <div key={entry.id} style={{ borderBottom: "2px solid var(--bg-card-2)" }}>
                <button
                  className="w-full px-5 py-4 flex items-center gap-3 text-left"
                  style={{ backgroundColor: "transparent" }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--bg-card-2)";
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                  }}
                  onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                >
                  <span
                    className="font-pixel flex-shrink-0 px-2 py-1"
                    style={{
                      fontSize: "7px",
                      color: MOOD_COLORS[entry.mood] ?? "#eee",
                      border: `2px solid ${MOOD_COLORS[entry.mood] ?? "#eee"}`,
                      minWidth: "68px",
                      textAlign: "center",
                    }}
                  >
                    {MOOD_LABELS[entry.mood] ?? "MEH"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      style={{
                        fontFamily: "var(--font-vt323), 'Courier New', monospace",
                        fontSize: "17px",
                        color: "var(--text)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {entry.culprit}
                    </p>
                    <p
                      className="font-pixel"
                      style={{ fontSize: "7px", color: "var(--text-dim)", marginTop: "2px" }}
                    >
                      {entry.createdAt}
                    </p>
                  </div>
                  <span
                    className="font-pixel flex-shrink-0"
                    style={{ fontSize: "9px", color: barColor(entry.damageScore) }}
                  >
                    {entry.damageScore}%
                  </span>
                </button>

                {expanded === entry.id && (
                  <div
                    className="px-5 pb-4 space-y-3"
                    style={{ borderTop: "2px solid var(--bg-card-2)" }}
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
                      {[
                        { k: "SLEEP", v: `${entry.sleepHours}h` },
                        { k: "MEETINGS", v: String(entry.meetings) },
                        { k: "WORK", v: `${entry.workHours}h` },
                        { k: "STRESS", v: entry.stressLevel },
                      ].map((m) => (
                        <div
                          key={m.k}
                          style={{
                            backgroundColor: "var(--bg-card-2)",
                            border: "2px solid var(--border)",
                            padding: "8px",
                            textAlign: "center",
                          }}
                        >
                          <p className="font-pixel" style={{ fontSize: "6px", color: "var(--text-muted)" }}>
                            {m.k}
                          </p>
                          <p
                            style={{
                              fontFamily: "var(--font-vt323), 'Courier New', monospace",
                              fontSize: "18px",
                              color: "var(--text)",
                            }}
                          >
                            {m.v}
                          </p>
                        </div>
                      ))}
                    </div>
                    {entry.annoyances.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {entry.annoyances.map((a) => (
                          <span
                            key={a}
                            className="font-pixel"
                            style={{
                              fontSize: "7px",
                              padding: "4px 8px",
                              backgroundColor: "var(--bg-card-2)",
                              border: "2px solid var(--accent)",
                              color: "var(--accent)",
                            }}
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
