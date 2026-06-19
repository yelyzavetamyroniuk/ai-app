"use client";

import { useState, useEffect, useRef } from "react";
import type { WDRAnalysis } from "@/types";

const ACTION_META = {
  focus:      { label: "ФОКУС-ЧАС",          color: "#2c3e7a" },
  priority:   { label: "ПРІОРИТИЗАЦІЯ ЗАДАЧ", color: "#F39C12" },
  recovery:   { label: "ПЛАН ВІДНОВЛЕННЯ",    color: "#27AE60" },
  boundaries: { label: "ВСТАНОВЛЕННЯ МЕЖ",    color: "#9B59B6" },
};

const vt = { fontFamily: "var(--font-vt323), 'Courier New', monospace" };

function barColor(pct: number) {
  if (pct <= 30) return "#27AE60";
  if (pct <= 60) return "#F39C12";
  if (pct <= 80) return "#e67e22";
  return "#E74C3C";
}

function scoreInfo(score: number) {
  if (score <= 20) return { label: "ЛЕГКИЙ ДЕНЬ",  color: "#27AE60" };
  if (score <= 40) return { label: "НОРМАЛЬНО",    color: "#27AE60" };
  if (score <= 60) return { label: "НАПРУЖЕНО",    color: "#F39C12" };
  if (score <= 80) return { label: "ВАЖКО",        color: "#e67e22" };
  return               { label: "НУ І ДЕНЬОК...", color: "#E74C3C" };
}

function useTypewriter(text: string, speed = 25) {
  const [out, setOut] = useState("");
  useEffect(() => {
    setOut("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return out;
}

function XPBar({ score }: { score: number }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(score), 300); return () => clearTimeout(t); }, [score]);
  const color = barColor(score);
  return (
    <div style={{ position: "relative", height: "36px", background: "#bbb", border: "4px solid #2C3E50", boxShadow: "4px 4px 0px #000" }}>
      <div style={{ width: `${w}%`, height: "100%", background: color, transition: "width 1.8s steps(20)" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...vt, fontSize: "22px", color: "#fff", textShadow: "1px 1px 0px #000" }}>
        {score} / 100 DAMAGE
      </div>
    </div>
  );
}

function HPBar({ pct }: { pct: number }) {
  const total = 20;
  const filled = Math.round((pct / 100) * total);
  const color = barColor(pct);
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: "14px", background: i < filled ? color : "#ccc", border: "1px solid #2C3E50" }} />
      ))}
    </div>
  );
}

function Toast({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="font-pixel" style={{ position: "fixed", bottom: "24px", right: "24px", background: "#FFF8DC", border: "4px solid #27AE60", boxShadow: "4px 4px 0px #000", padding: "12px 18px", fontSize: "10px", color: "#27AE60", animation: "toastIn 0.2s ease-out", zIndex: 100 }}>
      СКОПІЙОВАНО
    </div>
  );
}

function WDRChatWidget({ analysis }: { analysis: WDRAnalysis }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = { role: "user" as const, content: input.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/wdr-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, context: analysis }),
      });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.content }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Помилка. Спробуй ще раз." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pixel-card space-y-3" style={{ border: "4px solid #2c3e7a", boxShadow: "5px 5px 0px #000" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 className="font-pixel" style={{ fontSize: "10px", color: "#2c3e7a" }}>ПОГОВОРИТИ З AI</h3>
        <button className="pixel-btn" style={{ fontSize: "9px", padding: "6px 14px" }} onClick={() => setOpen(!open)}>
          {open ? "ЗАКРИТИ" : "ВІДКРИТИ ЧАТ"}
        </button>
      </div>

      {open && (
        <div className="space-y-2">
          <div style={{ height: "300px", overflowY: "auto", border: "3px solid var(--border)", background: "#fff", padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {messages.length === 0 && (
              <p style={{ ...vt, fontSize: "20px", color: "var(--text-dim)", textAlign: "center", marginTop: "20px" }}>
                Запитай про сьогоднішній день...
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "80%", padding: "10px 14px",
                  border: "3px solid #2C3E50",
                  background: m.role === "user" ? "#FFF8DC" : "#e0f0ff",
                  boxShadow: "3px 3px 0px #2C3E50",
                  ...vt, fontSize: "20px", lineHeight: 1.5,
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ padding: "10px 14px", border: "3px solid #2C3E50", background: "#e0f0ff", boxShadow: "3px 3px 0px #2C3E50" }}>
                  <span className="blink font-pixel" style={{ fontSize: "9px" }}>ДУМАЮ...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={send} style={{ display: "flex", gap: "8px" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Напиши питання..."
              disabled={loading}
              className="pixel-input"
              style={{ flex: 1 }}
            />
            <button type="submit" disabled={loading || !input.trim()}
              className="pixel-btn pixel-btn-cta"
              style={{ fontSize: "10px", padding: "10px 16px" }}>
              SEND
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export function DamageReport({ analysis }: { analysis: WDRAnalysis }) {
  const [copied, setCopied] = useState(false);
  const culprit = useTypewriter(analysis.culprit, 30);
  const action = ACTION_META[analysis.actionType] ?? ACTION_META.focus;
  const { label, color } = scoreInfo(analysis.damageScore);

  function copy() {
    navigator.clipboard.writeText(analysis.slackMessage).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 3500);
    });
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <Toast show={copied} />

      {/* Score */}
      <div className="pixel-card text-center space-y-4" style={{ border: `4px solid ${color}`, boxShadow: `6px 6px 0px #000` }}>
        <p className="font-pixel" style={{ fontSize: "9px", color: "#666" }}>DAMAGE REPORT</p>
        <div style={{ fontSize: "72px", color, lineHeight: 1, ...vt, textShadow: `3px 3px 0px #000` }}>
          {analysis.damageScore}<span style={{ fontSize: "36px", color: "#888" }}>%</span>
        </div>
        <p style={{ ...vt, fontSize: "28px", color }}>{label}</p>
        {analysis.damageScore > 80 && (
          <div className="blink" style={{ border: `3px solid #E74C3C`, padding: "8px 16px", ...vt, fontSize: "22px", color: "#E74C3C" }}>
            ! КРИТИЧНЕ НАВАНТАЖЕННЯ — ЗУПИНИСЬ
          </div>
        )}
        <XPBar score={analysis.damageScore} />
      </div>

      {/* Factors */}
      <div className="pixel-card space-y-4">
        <h3 className="font-pixel" style={{ fontSize: "10px", color: "#333", borderBottom: "2px solid #2C3E50", paddingBottom: "8px" }}>
          ОСНОВНІ ФАКТОРИ
        </h3>
        {analysis.factors.map((f, i) => (
          <div key={i} className="space-y-2">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ ...vt, fontSize: "22px", color: "var(--text)" }}>{f.name}</span>
              <span style={{ ...vt, fontSize: "24px", color: barColor(f.percentage) }}>{f.percentage}%</span>
            </div>
            <HPBar pct={f.percentage} />
          </div>
        ))}
      </div>

      {/* Main factor + culprit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="pixel-card space-y-2">
          <p className="font-pixel" style={{ fontSize: "8px", color: "#555" }}>ГОЛОВНИЙ ФАКТОР</p>
          <p style={{ ...vt, fontSize: "24px", color: "var(--text)" }}>{analysis.mainFactor}</p>
        </div>
        <div className="pixel-card space-y-2" style={{ border: "4px solid #F39C12", boxShadow: "5px 5px 0px #000" }}>
          <p className="font-pixel" style={{ fontSize: "8px", color: "#F39C12" }}>МЕМ ДНЯ</p>
          <p style={{ ...vt, fontSize: "22px", color: "#333", lineHeight: 1.5 }}>
            &ldquo;{culprit}<span className="blink">|</span>&rdquo;
          </p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="pixel-card space-y-4">
        <h3 className="font-pixel" style={{ fontSize: "10px", color: "#333", borderBottom: "2px solid #2C3E50", paddingBottom: "8px" }}>
          РЕКОМЕНДАЦІЇ
        </h3>
        <ol className="space-y-3">
          {analysis.recommendations.map((rec, i) => (
            <li key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <span className="font-pixel" style={{ fontSize: "9px", color: "#fff", background: "#E74C3C", border: "2px solid #111", boxShadow: "2px 2px 0px #000", padding: "4px 8px", flexShrink: 0, minWidth: "32px", textAlign: "center" }}>
                {i + 1}
              </span>
              <p style={{ ...vt, fontSize: "22px", color: "var(--text)", lineHeight: 1.5 }}>{rec}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Action / Slack message */}
      <div className="pixel-card space-y-4" style={{ border: `4px solid ${action.color}`, boxShadow: "5px 5px 0px #000" }}>
        <div>
          <p className="font-pixel" style={{ fontSize: "8px", color: action.color }}>РЕКОМЕНДОВАНА ДІЯ</p>
          <p style={{ ...vt, fontSize: "28px", color: action.color, marginTop: "4px" }}>{action.label}</p>
        </div>
        <div style={{ background: "#fff", border: "3px solid var(--border)", boxShadow: "inset 2px 2px 0px #ddd", padding: "14px 16px", ...vt, fontSize: "22px", color: "var(--text)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
          {analysis.slackMessage}
        </div>
        <button onClick={copy} className="pixel-btn w-full"
          style={{ fontSize: "10px", padding: "14px", background: copied ? "#d5f5e3" : "var(--bg-card-2)", borderColor: copied ? "#27AE60" : "var(--border)", color: copied ? "#27AE60" : "var(--text)" }}>
          {copied ? "СКОПІЙОВАНО" : "КОПІЮВАТИ"}
        </button>
      </div>

      {/* Chat with AI */}
      <WDRChatWidget analysis={analysis} />
    </div>
  );
}
