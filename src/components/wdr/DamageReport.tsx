"use client";

import { useState, useEffect } from "react";
import type { WDRAnalysis } from "@/types";

const ACTION_META = {
  focus:     { label: "FOCUS TIME",    desc: "Protect your deep work hours" },
  priority:  { label: "PRIORITIZE",   desc: "Align on what matters now" },
  recovery:  { label: "RECOVERY",     desc: "Recharge before tomorrow" },
  boundaries:{ label: "SET LIMITS",   desc: "Communicate your capacity" },
};

function barColor(pct: number): string {
  if (pct <= 30) return "#4cca6a";
  if (pct <= 60) return "#ffd700";
  if (pct <= 80) return "#ff9800";
  return "#e94560";
}

function scoreLabel(score: number) {
  if (score <= 20) return { label: "LIGHT DAY",    color: "#4cca6a" };
  if (score <= 40) return { label: "MANAGEABLE",   color: "#4cca6a" };
  if (score <= 60) return { label: "ROUGH",        color: "#ffd700" };
  if (score <= 80) return { label: "HEAVY",        color: "#ff9800" };
  return                  { label: "!! CRITICAL !!", color: "#e94560" };
}

/* ── Typewriter hook ─────────────────────────────── */
function useTypewriter(text: string, speed = 22) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return displayed;
}

/* ── Pixel HP bar ────────────────────────────────── */
function PixelHPBar({ percentage }: { percentage: number }) {
  const total = 20;
  const filled = Math.round((percentage / 100) * total);
  const color = barColor(percentage);
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: "12px",
            backgroundColor: i < filled ? color : "#0f3460",
            border: "1px solid #000",
            boxShadow: i < filled ? `0 0 4px ${color}60` : "none",
          }}
        />
      ))}
    </div>
  );
}

/* ── XP bar for damage score ─────────────────────── */
function XPBar({ score }: { score: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(score), 300);
    return () => clearTimeout(t);
  }, [score]);

  const color = barColor(score);
  return (
    <div
      style={{
        position: "relative",
        height: "28px",
        backgroundColor: "#0f3460",
        border: "3px solid var(--border)",
        boxShadow: "4px 4px 0px #000",
      }}
    >
      <div
        style={{
          width: `${width}%`,
          height: "100%",
          backgroundColor: color,
          transition: "width 1.8s steps(20)",
          boxShadow: `0 0 8px ${color}80`,
        }}
      />
      <div
        className="font-pixel"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "8px",
          color: "#fff",
          textShadow: "1px 1px 0px #000",
        }}
      >
        {score} / 100 DAMAGE
      </div>
    </div>
  );
}

/* ── Toast ───────────────────────────────────────── */
function PixelToast({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div
      className="font-pixel"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        fontSize: "9px",
        backgroundColor: "#0f3460",
        border: "3px solid #4cca6a",
        boxShadow: "4px 4px 0px #000",
        padding: "12px 16px",
        color: "#4cca6a",
        animation: "toastIn 0.2s ease-out",
        zIndex: 100,
      }}
    >
      +1 COPIED TO CLIPBOARD ✓
    </div>
  );
}

/* ── Main component ──────────────────────────────── */
export function DamageReport({ analysis }: { analysis: WDRAnalysis }) {
  const [copied, setCopied] = useState(false);
  const culpritText = useTypewriter(analysis.culprit, 28);
  const action = ACTION_META[analysis.actionType] ?? ACTION_META.focus;
  const { label, color } = scoreLabel(analysis.damageScore);

  function handleCopy() {
    navigator.clipboard.writeText(analysis.slackMessage).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3500);
    });
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <PixelToast show={copied} />

      {/* Score header */}
      <div className="pixel-card text-center space-y-4" style={{ border: `3px solid ${color}` }}>
        <p className="font-pixel" style={{ color: "var(--text-muted)", fontSize: "8px" }}>
          *** DAMAGE REPORT GENERATED ***
        </p>
        <p
          className="font-pixel"
          style={{ fontSize: "40px", color, textShadow: `0 0 20px ${color}80`, lineHeight: 1 }}
        >
          {analysis.damageScore}
        </p>
        <p className="font-pixel" style={{ color, fontSize: "10px" }}>{label}</p>

        {analysis.damageScore > 80 && (
          <div
            className="font-pixel blink"
            style={{
              border: `3px solid #e94560`,
              padding: "8px",
              color: "#e94560",
              fontSize: "9px",
            }}
          >
            !! WARNING: CRITICAL DAMAGE DETECTED !!
          </div>
        )}

        <XPBar score={analysis.damageScore} />
      </div>

      {/* Factors */}
      <div className="pixel-card space-y-4">
        <p className="font-pixel" style={{ color: "var(--accent)", fontSize: "8px" }}>
          &gt; DAMAGE FACTORS
        </p>
        {analysis.factors.map((factor, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between items-center">
              <span
                style={{
                  fontFamily: "var(--font-vt323), 'Courier New', monospace",
                  fontSize: "18px",
                  color: "var(--text)",
                }}
              >
                {factor.emoji} {factor.name}
              </span>
              <span
                className="font-pixel"
                style={{ fontSize: "9px", color: barColor(factor.percentage) }}
              >
                {factor.percentage}%
              </span>
            </div>
            <PixelHPBar percentage={factor.percentage} />
          </div>
        ))}
      </div>

      {/* Main factor + Culprit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="pixel-card space-y-2">
          <p className="font-pixel" style={{ color: "var(--accent)", fontSize: "7px" }}>
            &gt; MAIN FACTOR
          </p>
          <p
            style={{
              fontFamily: "var(--font-vt323), 'Courier New', monospace",
              fontSize: "20px",
              color: "var(--text)",
            }}
          >
            {analysis.mainFactor}
          </p>
        </div>
        <div className="pixel-card space-y-2" style={{ border: "3px solid var(--yellow)" }}>
          <p className="font-pixel" style={{ color: "var(--yellow)", fontSize: "7px" }}>
            &gt; ACHIEVEMENT UNLOCKED
          </p>
          <p
            style={{
              fontFamily: "var(--font-vt323), 'Courier New', monospace",
              fontSize: "18px",
              color: "var(--yellow)",
              minHeight: "60px",
            }}
          >
            &ldquo;{culpritText}
            <span className="blink">_</span>&rdquo;
          </p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="pixel-card space-y-4">
        <p className="font-pixel" style={{ color: "var(--accent)", fontSize: "8px" }}>
          &gt; RECOMMENDED ACTIONS
        </p>
        <div className="space-y-3">
          {analysis.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3">
              <span
                className="font-pixel flex-shrink-0"
                style={{
                  fontSize: "8px",
                  color: "#fff",
                  backgroundColor: "var(--accent)",
                  border: "2px solid #fff",
                  boxShadow: "2px 2px 0px #000",
                  padding: "2px 6px",
                  minWidth: "28px",
                  textAlign: "center",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <p
                style={{
                  fontFamily: "var(--font-vt323), 'Courier New', monospace",
                  fontSize: "18px",
                  color: "var(--text)",
                  lineHeight: "1.4",
                }}
              >
                {rec}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Action message */}
      <div className="pixel-card-accent space-y-4">
        <div>
          <p className="font-pixel" style={{ color: "var(--accent)", fontSize: "8px" }}>
            &gt; MISSION: {action.label}
          </p>
          <p
            style={{
              fontFamily: "var(--font-vt323), 'Courier New', monospace",
              fontSize: "16px",
              color: "var(--text-muted)",
              marginTop: "4px",
            }}
          >
            {action.desc}
          </p>
        </div>
        <div
          style={{
            backgroundColor: "var(--bg-card-2)",
            border: "3px solid var(--border)",
            boxShadow: "inset 2px 2px 0px #000",
            padding: "12px 14px",
            fontFamily: "var(--font-vt323), 'Courier New', monospace",
            fontSize: "18px",
            color: "var(--text)",
            lineHeight: "1.5",
            whiteSpace: "pre-wrap",
          }}
        >
          {analysis.slackMessage}
        </div>
        <button
          onClick={handleCopy}
          className="pixel-btn w-full"
          style={{
            fontSize: "9px",
            padding: "12px",
            borderColor: copied ? "#4cca6a" : "var(--border)",
            color: copied ? "#4cca6a" : "var(--text)",
            backgroundColor: copied ? "rgba(76,202,106,0.1)" : "var(--bg-card-2)",
          }}
        >
          {copied ? "COPIED! GO GET COFFEE ☕" : "[ COPY TO CLIPBOARD ]"}
        </button>
      </div>
    </div>
  );
}
