"use client";

import { useState } from "react";
import type { WDRAnalysis } from "@/types";

const ACTION_META = {
  focus: { emoji: "🎯", label: "Час на фокус", desc: "Захисти свій час від переривань" },
  priority: { emoji: "📋", label: "Пріоритизація", desc: "Визнач що важливо зараз" },
  recovery: { emoji: "🌿", label: "План відновлення", desc: "Подбай про себе сьогодні" },
  boundaries: { emoji: "🔒", label: "Встановлення меж", desc: "Повідом команду про ліміти" },
};

function scoreColor(pct: number): string {
  if (pct <= 30) return "var(--green)";
  if (pct <= 60) return "var(--yellow)";
  if (pct <= 80) return "var(--orange)";
  return "var(--red)";
}

function scoreLabel(score: number): { emoji: string; text: string } {
  if (score <= 20) return { emoji: "😌", text: "Легкий день" };
  if (score <= 40) return { emoji: "🙂", text: "Норм" };
  if (score <= 60) return { emoji: "😤", text: "Напруженно" };
  if (score <= 80) return { emoji: "😵", text: "Важкувато" };
  return { emoji: "🤯", text: "Ну і деньок..." };
}

export function DamageReport({ analysis }: { analysis: WDRAnalysis }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(analysis.slackMessage).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  }

  const label = scoreLabel(analysis.damageScore);
  const action = ACTION_META[analysis.actionType] ?? ACTION_META.focus;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div
        className="rounded-2xl p-6 text-center card-accent-border"
        style={{ backgroundColor: "var(--bg-card)" }}
      >
        <p className="text-sm font-medium mb-2" style={{ color: "var(--text-muted)" }}>
          📉 Damage Report
        </p>
        <div className="text-7xl font-black mb-2" style={{ color: scoreColor(analysis.damageScore) }}>
          {analysis.damageScore}
          <span className="text-3xl" style={{ color: "var(--text-muted)" }}>%</span>
        </div>
        <p className="text-xl font-semibold" style={{ color: "var(--text)" }}>
          {label.emoji} {label.text}
        </p>
        {analysis.damageScore > 80 && (
          <div
            className="mt-3 inline-block px-4 py-1.5 rounded-full text-sm font-medium"
            style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "var(--red)", border: "1px solid rgba(239,68,68,0.3)" }}
          >
            🤯 Ну і деньок...
          </div>
        )}
      </div>

      {/* Factors */}
      <div
        className="rounded-2xl p-5 card-glow"
        style={{ backgroundColor: "var(--bg-card)" }}
      >
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-muted)" }}>
          📊 Основні фактори
        </h3>
        <div className="space-y-3">
          {analysis.factors.map((factor, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm" style={{ color: "var(--text)" }}>
                  {factor.emoji} {factor.name}
                </span>
                <span className="text-xs font-mono font-bold" style={{ color: scoreColor(factor.percentage) }}>
                  {factor.percentage}%
                </span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: "var(--bg-card-2)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${factor.percentage}%`,
                    backgroundColor: scoreColor(factor.percentage),
                    boxShadow: `0 0 8px ${scoreColor(factor.percentage)}60`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main factor + culprit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className="rounded-2xl p-5 card-glow"
          style={{ backgroundColor: "var(--bg-card)" }}
        >
          <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>
            🎯 Головний фактор дня
          </p>
          <p className="text-base font-semibold" style={{ color: "var(--text)" }}>
            {analysis.mainFactor}
          </p>
        </div>
        <div
          className="rounded-2xl p-5 card-glow"
          style={{ backgroundColor: "var(--bg-card)" }}
        >
          <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>
            🏆 Мем дня
          </p>
          <p
            className="text-sm italic leading-relaxed"
            style={{ color: "var(--accent-2)" }}
          >
            &ldquo;{analysis.culprit}&rdquo;
          </p>
        </div>
      </div>

      {/* Recommendations */}
      <div
        className="rounded-2xl p-5 card-glow"
        style={{ backgroundColor: "var(--bg-card)" }}
      >
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-muted)" }}>
          💡 Рекомендації
        </h3>
        <ul className="space-y-2.5">
          {analysis.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text)" }}>
              <span
                className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: "var(--accent-glow)", color: "var(--accent-2)" }}
              >
                {i + 1}
              </span>
              {rec}
            </li>
          ))}
        </ul>
      </div>

      {/* Action + Slack message */}
      <div
        className="rounded-2xl p-5 card-glow"
        style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-accent)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{action.emoji}</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--accent-2)" }}>
              {action.label}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{action.desc}</p>
          </div>
        </div>
        <div
          className="rounded-xl p-4 mb-3 text-sm leading-relaxed whitespace-pre-wrap"
          style={{
            backgroundColor: "var(--bg-card-2)",
            border: "1px solid var(--border)",
            color: "var(--text)",
          }}
        >
          {analysis.slackMessage}
        </div>
        <button
          onClick={handleCopy}
          className="w-full py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{
            backgroundColor: copied ? "rgba(34,197,94,0.15)" : "var(--accent-glow)",
            border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : "var(--border-accent)"}`,
            color: copied ? "var(--green)" : "var(--accent-2)",
          }}
        >
          {copied ? "✅ Скопійовано! Тепер вставляй і йди пити каву ☕" : "📋 Копіювати"}
        </button>
      </div>
    </div>
  );
}
