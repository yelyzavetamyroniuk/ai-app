"use client";

import { useState } from "react";
import type { WDRAnalysis } from "@/types";
import { DamageReport } from "./DamageReport";

const MOODS = [
  { value: 4, label: "ВІДМІННО", color: "#27AE60" },
  { value: 3, label: "ДОБРЕ",    color: "#2ecc71" },
  { value: 2, label: "ТАК СОБІ", color: "#F39C12" },
  { value: 1, label: "ПОГАНО",   color: "#e67e22" },
  { value: 0, label: "ЖАХЛИВО",  color: "#E74C3C" },
];

const STRESS_LEVELS = [
  { value: "Спокійно",       label: "СПОКІЙНО",      color: "#27AE60" },
  { value: "Нормально",      label: "НОРМАЛЬНО",     color: "#888" },
  { value: "Напружено",      label: "НАПРУЖЕНО",     color: "#F39C12" },
  { value: "Тривожно",       label: "ТРИВОЖНО",      color: "#e67e22" },
  { value: "Перевантаження", label: "ПЕРЕВАНТАЖЕННЯ",color: "#E74C3C", shake: true },
  { value: "Критично",       label: "КРИТИЧНО",      color: "#922b21", shake: true },
];

const ANNOYANCES = [
  { value: "Комунікація з командою", label: "Комунікація з командою" },
  { value: "Багато зустрічей",       label: "Багато зустрічей" },
  { value: "Пріоритети та дедлайни", label: "Пріоритети та дедлайни" },
  { value: "Неочікувані проблеми",   label: "Неочікувані проблеми" },
  { value: "Особисті справи",        label: "Особисті справи" },
  { value: "Фокус мод",              label: "Фокус мод" },
  { value: "Важко сказати",          label: "Важко сказати" },
  { value: "Все одразу",             label: "Все одразу" },
];

const SLEEP_OPTIONS = [
  { label: "0-3г", value: 2 },
  { label: "4-5г", value: 4.5 },
  { label: "6-7г", value: 6.5 },
  { label: "8-9г", value: 8.5 },
  { label: "10+г", value: 10 },
];

const MEETING_OPTIONS = [
  { label: "0",   value: 0 },
  { label: "1-2", value: 1 },
  { label: "3-4", value: 3 },
  { label: "5-6", value: 5 },
  { label: "7+",  value: 7 },
];

const WORK_OPTIONS = [
  { label: "0-4г",  value: 4 },
  { label: "5-6г",  value: 5.5 },
  { label: "7-8г",  value: 7.5 },
  { label: "9-10г", value: 9.5 },
  { label: "10+г",  value: 11 },
];

const DISTRACTION_OPTIONS = [
  { label: "Майже ні",               value: 0 },
  { label: "Декілька разів",         value: 2 },
  { label: "Постійно",               value: 5 },
  { label: "Не давали працювати",    value: 8 },
  { label: "Не дали навіть пообідати", value: 10 },
];

type FormState = {
  mood: number; sleepHours: number; meetings: number;
  workHours: number; distractions: number; stressLevel: string;
  annoyances: string[]; comment: string;
};

const vt = { fontFamily: "var(--font-vt323), 'Courier New', monospace" };

export function CheckinForm() {
  const [form, setForm] = useState<FormState>({
    mood: 2, sleepHours: 6.5, meetings: 1, workHours: 7.5,
    distractions: 2, stressLevel: "Нормально", annoyances: [], comment: "",
  });
  const [isShaking, setIsShaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<WDRAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function selectStress(value: string, shake?: boolean) {
    set("stressLevel", value);
    if (shake) { setIsShaking(true); setTimeout(() => setIsShaking(false), 550); }
  }

  function toggleAnnoyance(val: string) {
    set("annoyances", form.annoyances.includes(val)
      ? form.annoyances.filter((a) => a !== val)
      : [...form.annoyances, val]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, comment: form.comment || undefined }),
      });
      if (res.status === 401) { setError("Потрібна авторизація."); return; }
      if (!res.ok) { setError("Помилка сервера. Спробуй ще раз."); return; }
      setResult((await res.json()).analysis);
    } catch { setError("Помилка з'єднання."); }
    finally { setIsLoading(false); }
  }

  if (result) {
    return (
      <div className="space-y-4">
        <DamageReport analysis={result} />
        <button onClick={() => setResult(null)} className="pixel-btn w-full" style={{ fontSize: "10px", padding: "14px" }}>
          НОВИЙ ЧЕКІН
        </button>
      </div>
    );
  }

  return (
    <div className={isShaking ? "shake" : ""}>
      <form onSubmit={handleSubmit} className="space-y-4">

        <Section num="01" title="Як ти сьогодні?">
          <div className="flex gap-2 flex-wrap">
            {MOODS.map((m) => {
              const sel = form.mood === m.value;
              return (
                <button key={m.value} type="button"
                  onClick={() => set("mood", m.value)}
                  className="pixel-btn flex-1"
                  style={{
                    fontSize: "9px", padding: "12px 4px", minWidth: "60px",
                    background: sel ? m.color : "var(--bg-card-2)",
                    color: sel ? "#fff" : "var(--text)",
                    borderColor: sel ? "#111" : "var(--border)",
                    boxShadow: sel ? "2px 2px 0px #000" : "4px 4px 0px var(--border)",
                    transform: sel ? "translate(2px,2px)" : undefined,
                  }}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </Section>

        <Section num="02" title="Скільки годин спав/ла?">
          <OptionButtons options={SLEEP_OPTIONS} value={form.sleepHours} onChange={(v) => set("sleepHours", v)} />
        </Section>

        <Section num="03" title="Скільки зустрічей?">
          <OptionButtons options={MEETING_OPTIONS} value={form.meetings} onChange={(v) => set("meetings", v)} />
        </Section>

        <Section num="04" title="Скільки годин працював/ла?">
          <OptionButtons options={WORK_OPTIONS} value={form.workHours} onChange={(v) => set("workHours", v)} />
        </Section>

        <Section num="05" title="Скільки разів відволікали?">
          <div className="grid grid-cols-1 gap-2">
            {DISTRACTION_OPTIONS.map((o) => {
              const sel = form.distractions === o.value;
              return (
                <button key={o.label} type="button"
                  onClick={() => set("distractions", o.value)}
                  className="pixel-btn text-left"
                  style={{
                    justifyContent: "flex-start", padding: "12px 16px",
                    background: sel ? "#2c3e7a" : "var(--bg-card-2)",
                    color: sel ? "#fff" : "var(--text)",
                    borderColor: sel ? "#111" : "var(--border)",
                    boxShadow: sel ? "2px 2px 0px #000" : "4px 4px 0px var(--border)",
                    transform: sel ? "translate(2px,2px)" : undefined,
                    ...vt, fontSize: "20px",
                  }}
                >
                  <span style={{ marginRight: "8px" }}>{sel ? ">" : "o"}</span>
                  {o.label}
                </button>
              );
            })}
          </div>
        </Section>

        <Section num="06" title="Рівень стресу:">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {STRESS_LEVELS.map((s) => {
              const sel = form.stressLevel === s.value;
              return (
                <button key={s.value} type="button"
                  onClick={() => selectStress(s.value, s.shake)}
                  className="pixel-btn"
                  style={{
                    fontSize: "8px", padding: "12px",
                    background: sel ? s.color : "var(--bg-card-2)",
                    color: sel ? "#fff" : "var(--text)",
                    borderColor: sel ? "#111" : s.color,
                    boxShadow: sel ? "2px 2px 0px #000" : "4px 4px 0px var(--border)",
                    transform: sel ? "translate(2px,2px)" : undefined,
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </Section>

        <Section num="07" title="Що найбільше вплинуло на твій день?">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ANNOYANCES.map((a) => {
              const sel = form.annoyances.includes(a.value);
              return (
                <button key={a.value} type="button"
                  onClick={() => toggleAnnoyance(a.value)}
                  className="pixel-btn text-left"
                  style={{
                    justifyContent: "flex-start", padding: "12px 14px",
                    background: sel ? "#2c3e7a" : "var(--bg-card-2)",
                    color: sel ? "#fff" : "var(--text)",
                    borderColor: sel ? "#111" : "var(--border)",
                    boxShadow: sel ? "2px 2px 0px #000" : "4px 4px 0px var(--border)",
                    transform: sel ? "translate(2px,2px)" : undefined,
                    ...vt, fontSize: "20px",
                  }}
                >
                  <span style={{ marginRight: "6px" }}>{sel ? "+" : "o"}</span>
                  {a.label}
                </button>
              );
            })}
          </div>
        </Section>

        <Section num="08" title="Коментар (необов'язково)">
          <textarea
            value={form.comment}
            onChange={(e) => set("comment", e.target.value)}
            placeholder="Що ще вплинуло на твій день?"
            rows={3} maxLength={500}
            className="pixel-input" style={{ resize: "none" }}
          />
          <p style={{ textAlign: "right", ...vt, fontSize: "18px", color: "var(--text-dim)", marginTop: "4px" }}>
            {form.comment.length}/500
          </p>
        </Section>

        {error && (
          <div className="pixel-card" style={{ border: "3px solid #E74C3C" }}>
            <p style={{ color: "#E74C3C", ...vt, fontSize: "22px" }}>{error}</p>
          </div>
        )}

        <button type="submit" disabled={isLoading}
          className="pixel-btn pixel-btn-cta w-full"
          style={{
            fontSize: "11px", padding: "20px",
            boxShadow: isLoading ? "0px 0px 0px #000" : "6px 6px 0px #000",
            transform: isLoading ? "translate(4px,4px)" : undefined,
          }}
        >
          {isLoading
            ? <span className="flex items-center gap-3"><span className="blink">█</span> АНАЛІЗУЮ ТВІЙ ДЕНЬ... <span className="blink">█</span></span>
            : "ЗГЕНЕРУВАТИ DAMAGE REPORT"}
        </button>
      </form>
    </div>
  );
}

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="pixel-card space-y-4">
      <div style={{ borderBottom: "2px solid #E74C3C", paddingBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
        <span className="font-pixel" style={{ fontSize: "9px", background: "#E74C3C", color: "#fff", padding: "3px 8px" }}>
          {num}
        </span>
        <span style={{ fontFamily: "var(--font-vt323), 'Courier New', monospace", fontSize: "24px", color: "var(--text)" }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function OptionButtons({ options, value, onChange }: {
  options: { label: string; value: number }[];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((o) => {
        const sel = value === o.value;
        return (
          <button key={o.label} type="button"
            onClick={() => onChange(o.value)}
            className="pixel-btn flex-1"
            style={{
              fontSize: "9px", padding: "12px 6px", minWidth: "60px",
              background: sel ? "#2c3e7a" : "var(--bg-card-2)",
              color: sel ? "#fff" : "var(--text)",
              borderColor: sel ? "#111" : "var(--border)",
              boxShadow: sel ? "2px 2px 0px #000" : "4px 4px 0px var(--border)",
              transform: sel ? "translate(2px,2px)" : undefined,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
