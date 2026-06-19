"use client";

import { useState } from "react";
import type { MoodEntryDisplay, DashboardMetrics, DashboardInsight } from "@/types";

const MOOD_EMOJIS = ["😫", "😕", "😐", "😀", "😃"];

function scoreColor(s: number): string {
  if (s <= 30) return "var(--green)";
  if (s <= 60) return "var(--yellow)";
  if (s <= 80) return "var(--orange)";
  return "var(--red)";
}

function MoodChart({ entries }: { entries: MoodEntryDisplay[] }) {
  const data = [...entries].reverse();
  if (data.length < 2) {
    return (
      <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>
        Потрібно мінімум 2 записи для графіку
      </p>
    );
  }

  const W = 600;
  const H = 100;
  const pad = 16;
  const innerW = W - pad * 2;
  const innerH = H - pad * 2;

  const moodPoints = data.map((e, i) => {
    const x = pad + (i / (data.length - 1)) * innerW;
    const y = pad + (1 - e.mood / 4) * innerH;
    return { x, y };
  });

  const dmgPoints = data.map((e, i) => {
    const x = pad + (i / (data.length - 1)) * innerW;
    const y = pad + (1 - e.damageScore / 100) * innerH;
    return { x, y };
  });

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.5 rounded" style={{ backgroundColor: "var(--accent-2)" }} />
          Настрій
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.5 rounded" style={{ backgroundColor: "var(--red)" }} />
          Damage Score
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-2)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--accent-2)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={pad}
            y1={pad + t * innerH}
            x2={W - pad}
            y2={pad + t * innerH}
            stroke="var(--border)"
            strokeWidth="0.5"
          />
        ))}

        {/* Damage score line */}
        <path
          d={toPath(dmgPoints)}
          fill="none"
          stroke="var(--red)"
          strokeWidth="1.5"
          strokeOpacity="0.5"
          strokeDasharray="4 2"
        />

        {/* Mood area fill */}
        <path
          d={`${toPath(moodPoints)} L${(W - pad).toFixed(1)},${(H - pad / 2).toFixed(1)} L${pad},${(H - pad / 2).toFixed(1)} Z`}
          fill="url(#moodGrad)"
        />

        {/* Mood line */}
        <path
          d={toPath(moodPoints)}
          fill="none"
          stroke="var(--accent-2)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Mood dots */}
        {moodPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--accent-2)" />
        ))}
      </svg>
      <div className="flex justify-between text-xs" style={{ color: "var(--text-dim)" }}>
        <span>{data[0]?.createdAt}</span>
        <span>{data[data.length - 1]?.createdAt}</span>
      </div>
    </div>
  );
}

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
    <div className="space-y-6">
      {/* Warning banner */}
      {showWarning && (
        <div
          className="rounded-2xl px-5 py-4 animate-fade-in"
          style={{
            backgroundColor: "rgba(234,179,8,0.08)",
            border: "1px solid rgba(234,179,8,0.3)",
            color: "var(--yellow)",
          }}
        >
          <p className="text-sm font-medium">
            ⚠️ Важко, так? Але ти з кожним днем все ближче до зарплати 💸
          </p>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          label="Середній настрій"
          value={MOOD_EMOJIS[Math.round(metrics.avgMood)] ?? "😐"}
          sub={`${metrics.avgMood.toFixed(1)}/4`}
        />
        <MetricCard
          label="Середній сон"
          value={`${metrics.avgSleep.toFixed(1)}год`}
          sub="за 30 днів"
        />
        <MetricCard
          label="Avg Damage Score"
          value={`${Math.round(metrics.avgDamageScore)}%`}
          valueColor={scoreColor(metrics.avgDamageScore)}
          sub="навантаження"
        />
        <div
          className="rounded-2xl p-4 card-glow flex flex-col items-center text-center"
          style={{ backgroundColor: "var(--bg-card)" }}
        >
          <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>🏆 Зустрічей-повідомлень</p>
          <p
            className="text-3xl font-black"
            style={{ color: "var(--accent-2)" }}
          >
            {meetingsCounter}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
            могли бути у Slack
          </p>
        </div>
      </div>

      {/* Chart */}
      {entries.length > 0 && (
        <div
          className="rounded-2xl p-5 card-glow"
          style={{ backgroundColor: "var(--bg-card)" }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-muted)" }}>
            📈 Динаміка настрою та навантаження
          </h3>
          <MoodChart entries={entries} />
        </div>
      )}

      {/* Top annoyances */}
      {metrics.topAnnoyances.length > 0 && (
        <div
          className="rounded-2xl p-5 card-glow"
          style={{ backgroundColor: "var(--bg-card)" }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-muted)" }}>
            📊 Найчастіші фактори навантаження
          </h3>
          <div className="space-y-2.5">
            {metrics.topAnnoyances.slice(0, 5).map((a) => {
              const pct = Math.round((a.count / entries.length) * 100);
              return (
                <div key={a.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm" style={{ color: "var(--text)" }}>{a.name}</span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {a.count}× ({pct}%)
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: "var(--bg-card-2)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: "var(--accent)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Insights */}
      {insights.length > 0 && (
        <div
          className="rounded-2xl p-5 card-glow"
          style={{ backgroundColor: "var(--bg-card)" }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-muted)" }}>
            🤖 AI Insights
          </h3>
          <ul className="space-y-3">
            {insights.map((insight, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm rounded-xl p-3"
                style={{
                  backgroundColor: "var(--bg-card-2)",
                  color: "var(--text)",
                }}
              >
                <span style={{ color: "var(--accent-2)" }}>✦</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* History */}
      <div
        className="rounded-2xl card-glow overflow-hidden"
        style={{ backgroundColor: "var(--bg-card)" }}
      >
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
            📋 Історія Damage Reports
          </h3>
        </div>
        {entries.length === 0 ? (
          <p className="text-sm text-center py-10" style={{ color: "var(--text-muted)" }}>
            Ще немає записів. Зроби перший чекін!
          </p>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {entries.map((entry) => (
              <div key={entry.id}>
                <button
                  className="w-full px-5 py-4 flex items-center gap-4 text-left transition-colors hover:bg-[var(--bg-card-2)]"
                  onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                >
                  <span className="text-2xl flex-shrink-0">{MOOD_EMOJIS[entry.mood]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>
                      {entry.culprit}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {entry.createdAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className="text-sm font-bold font-mono"
                      style={{ color: scoreColor(entry.damageScore) }}
                    >
                      {entry.damageScore}%
                    </span>
                    <span
                      className="text-xs transition-transform"
                      style={{
                        color: "var(--text-dim)",
                        transform: expanded === entry.id ? "rotate(180deg)" : "rotate(0)",
                        display: "inline-block",
                      }}
                    >
                      ▼
                    </span>
                  </div>
                </button>
                {expanded === entry.id && (
                  <div
                    className="px-5 pb-4 space-y-2"
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
                      {[
                        { label: "Сон", value: `${entry.sleepHours}год` },
                        { label: "Зустрічей", value: String(entry.meetings) },
                        { label: "Роботи", value: `${entry.workHours}год` },
                        { label: "Стрес", value: entry.stressLevel },
                      ].map((m) => (
                        <div
                          key={m.label}
                          className="rounded-lg p-2.5 text-center"
                          style={{ backgroundColor: "var(--bg-card-2)" }}
                        >
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{m.label}</p>
                          <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--text)" }}>
                            {m.value}
                          </p>
                        </div>
                      ))}
                    </div>
                    {entry.annoyances.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {entry.annoyances.map((a) => (
                          <span
                            key={a}
                            className="px-2 py-1 rounded-full text-xs"
                            style={{
                              backgroundColor: "var(--accent-glow)",
                              color: "var(--accent-2)",
                              border: "1px solid var(--border-accent)",
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

function MetricCard({
  label,
  value,
  sub,
  valueColor,
}: {
  label: string;
  value: string;
  sub: string;
  valueColor?: string;
}) {
  return (
    <div
      className="rounded-2xl p-4 card-glow flex flex-col items-center text-center"
      style={{ backgroundColor: "var(--bg-card)" }}
    >
      <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p
        className="text-2xl sm:text-3xl font-black"
        style={{ color: valueColor ?? "var(--text)" }}
      >
        {value}
      </p>
      <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>{sub}</p>
    </div>
  );
}
