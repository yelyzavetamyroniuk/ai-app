"use client";

import { useState } from "react";
import type { WDRAnalysis } from "@/types";
import { DamageReport } from "./DamageReport";

const MOODS = [
  { value: 4, label: "GREAT" },
  { value: 3, label: "GOOD" },
  { value: 2, label: "MEH" },
  { value: 1, label: "BAD" },
  { value: 0, label: "CRITICAL" },
];

const STRESS_LEVELS = [
  { value: "Спокійно",      label: "CALM",     color: "#4cca6a" },
  { value: "Нормально",     label: "OK",       color: "#aaaaaa" },
  { value: "Напружено",     label: "TENSE",    color: "#ffd700" },
  { value: "Тривожно",      label: "ANXIOUS",  color: "#ff9800" },
  { value: "Перевантаження",label: "OVERLOAD", color: "#e94560", shake: true },
  { value: "Критично",      label: "CRITICAL", color: "#e94560", shake: true, blink: true },
];

const ANNOYANCES = [
  { value: "🧑‍💼 Комунікація з командою", label: "TEAM COMMS" },
  { value: "📅 Багато зустрічей",         label: "TOO MANY MEETINGS" },
  { value: "📊 Пріоритети та дедлайни",   label: "DEADLINES" },
  { value: "🐞 Неочікувані проблеми",     label: "UNEXPECTED BUGS" },
  { value: "🏠 Особисті справи",         label: "PERSONAL STUFF" },
  { value: "🎯 Фокус мод",               label: "FOCUS MODE" },
  { value: "🤷 Важко сказати",           label: "HARD TO SAY" },
  { value: "🔥 Все одразу",              label: "EVERYTHING AT ONCE" },
];

function distractionsLabel(val: number): string {
  const labels = [
    "NONE",
    "1-2 TIMES",
    "A FEW TIMES",
    "OFTEN",
    "CONSTANTLY",
    "VERY OFTEN",
    "LOST COUNT",
    "NON-STOP",
    "CHAOS",
    "CRITICAL",
    "DIDN'T EAT LUNCH",
  ];
  return labels[Math.min(val, 10)];
}

type FormState = {
  mood: number;
  sleepHours: number;
  meetings: number;
  workHours: number;
  distractions: number;
  stressLevel: string;
  annoyances: string[];
  comment: string;
};

export function CheckinForm() {
  const [form, setForm] = useState<FormState>({
    mood: 2,
    sleepHours: 7,
    meetings: 2,
    workHours: 8,
    distractions: 3,
    stressLevel: "Нормально",
    annoyances: [],
    comment: "",
  });
  const [isShaking, setIsShaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<WDRAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleStressSelect(value: string, shake?: boolean) {
    setField("stressLevel", value);
    if (shake) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
    }
  }

  function toggleAnnoyance(val: string) {
    setForm((prev) => ({
      ...prev,
      annoyances: prev.annoyances.includes(val)
        ? prev.annoyances.filter((a) => a !== val)
        : [...prev.annoyances, val],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: form.mood,
          sleepHours: form.sleepHours,
          meetings: form.meetings,
          workHours: form.workHours,
          distractions: form.distractions,
          stressLevel: form.stressLevel,
          annoyances: form.annoyances,
          comment: form.comment || undefined,
        }),
      });

      if (res.status === 401) {
        setError("ERROR: AUTHENTICATION REQUIRED. Please sign in.");
        return;
      }
      if (!res.ok) {
        setError("ERROR: SERVER FAILURE. Try again.");
        return;
      }

      const data = await res.json();
      setResult(data.analysis);
    } catch {
      setError("ERROR: CONNECTION FAILED. Check network.");
    } finally {
      setIsLoading(false);
    }
  }

  if (result) {
    return (
      <div className="space-y-4">
        <DamageReport analysis={result} />
        <button
          onClick={() => setResult(null)}
          className="pixel-btn w-full"
          style={{ fontSize: "9px", padding: "12px" }}
        >
          &lt;&lt; NEW CHECKIN
        </button>
      </div>
    );
  }

  return (
    <div className={isShaking ? "shake" : ""}>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* 1. Mood */}
        <PixelSection label="01 // HOW ARE YOU TODAY?">
          <div className="flex gap-2">
            {MOODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setField("mood", m.value)}
                className={`pixel-btn flex-1 ${form.mood === m.value ? "pixel-btn-selected" : ""}`}
                style={{ fontSize: "8px", padding: "10px 4px" }}
              >
                {form.mood === m.value ? "▶" : " "} {m.label}
              </button>
            ))}
          </div>
        </PixelSection>

        {/* 2. Sleep */}
        <PixelSection label="02 // SLEEP HOURS">
          <PixelSlider
            value={form.sleepHours}
            min={0} max={10} step={0.5}
            onChange={(v) => setField("sleepHours", v)}
            displayValue={`${form.sleepHours} HRS`}
            leftLabel="0" rightLabel="10+"
          />
        </PixelSection>

        {/* 3. Meetings */}
        <PixelSection label="03 // MEETINGS TODAY">
          <PixelSlider
            value={form.meetings}
            min={0} max={8} step={1}
            onChange={(v) => setField("meetings", v)}
            displayValue={form.meetings === 0 ? "ZERO (LUCKY)" : form.meetings >= 8 ? "8+ (RIP)" : String(form.meetings)}
            leftLabel="0" rightLabel="8+"
          />
        </PixelSection>

        {/* 4. Work hours */}
        <PixelSection label="04 // WORK HOURS">
          <PixelSlider
            value={form.workHours}
            min={0} max={12} step={0.5}
            onChange={(v) => setField("workHours", v)}
            displayValue={`${form.workHours} HRS`}
            leftLabel="0" rightLabel="12+"
          />
        </PixelSection>

        {/* 5. Distractions */}
        <PixelSection label="05 // TIMES INTERRUPTED">
          <PixelSlider
            value={form.distractions}
            min={0} max={10} step={1}
            onChange={(v) => setField("distractions", v)}
            displayValue={distractionsLabel(form.distractions)}
            leftLabel="NONE" rightLabel="CRITICAL"
          />
        </PixelSection>

        {/* 6. Stress */}
        <PixelSection label="06 // STRESS LEVEL">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {STRESS_LEVELS.map((s) => {
              const selected = form.stressLevel === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => handleStressSelect(s.value, s.shake)}
                  className={`pixel-btn ${selected ? "pixel-btn-selected" : ""} ${s.blink && selected ? "blink" : ""}`}
                  style={{
                    fontSize: "8px",
                    borderColor: selected ? "#fff" : s.color,
                    color: selected ? "#fff" : s.color,
                    backgroundColor: selected ? s.color : "var(--bg-card-2)",
                  }}
                >
                  {selected ? "▶" : "○"} {s.label}
                </button>
              );
            })}
          </div>
        </PixelSection>

        {/* 7. Annoyances */}
        <PixelSection label="07 // WHAT DAMAGED YOUR DAY?">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ANNOYANCES.map((a) => {
              const selected = form.annoyances.includes(a.value);
              return (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => toggleAnnoyance(a.value)}
                  className={`pixel-btn text-left ${selected ? "pixel-btn-selected" : ""}`}
                  style={{ fontSize: "8px", justifyContent: "flex-start", padding: "10px 12px" }}
                >
                  {selected ? "[X]" : "[ ]"} {a.label}
                </button>
              );
            })}
          </div>
        </PixelSection>

        {/* 8. Comment */}
        <PixelSection label="08 // ADDITIONAL NOTES (OPTIONAL)">
          <textarea
            value={form.comment}
            onChange={(e) => setField("comment", e.target.value)}
            placeholder="> TYPE HERE..."
            rows={3}
            maxLength={500}
            className="pixel-input"
            style={{ resize: "none" }}
          />
          <p
            className="text-right mt-1"
            style={{
              fontFamily: "var(--font-pixel), 'Courier New', monospace",
              fontSize: "8px",
              color: "var(--text-dim)",
            }}
          >
            {form.comment.length}/500
          </p>
        </PixelSection>

        {/* Error */}
        {error && (
          <div
            className="pixel-card"
            style={{ border: "3px solid var(--red)", color: "var(--red)" }}
          >
            <p className="font-pixel" style={{ fontSize: "8px" }}>{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="pixel-btn pixel-btn-primary w-full"
          style={{
            fontSize: "10px",
            padding: "18px",
            boxShadow: isLoading ? "0px 0px 0px #000" : "6px 6px 0px #000",
            transform: isLoading ? "translate(4px, 4px)" : undefined,
          }}
        >
          {isLoading ? (
            <span className="flex items-center gap-3">
              <span className="blink">█</span>
              ANALYZING DAY... PLEASE WAIT
              <span className="blink">█</span>
            </span>
          ) : (
            "▶▶ GENERATE DAMAGE REPORT ◀◀"
          )}
        </button>
      </form>
    </div>
  );
}

function PixelSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pixel-card space-y-4">
      <p
        className="font-pixel"
        style={{ color: "var(--accent)", fontSize: "8px", borderBottom: "1px solid var(--accent)", paddingBottom: "8px" }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

function PixelSlider({
  value, min, max, step,
  onChange, displayValue, leftLabel, rightLabel,
}: {
  value: number; min: number; max: number; step: number;
  onChange: (v: number) => void;
  displayValue: string; leftLabel: string; rightLabel: string;
}) {
  return (
    <div className="space-y-3">
      <div className="text-center">
        <span
          className="font-pixel inline-block px-3 py-2"
          style={{
            fontSize: "9px",
            backgroundColor: "var(--accent)",
            color: "#fff",
            border: "3px solid #fff",
            boxShadow: "3px 3px 0px #000",
          }}
        >
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div
        className="flex justify-between font-pixel"
        style={{ fontSize: "7px", color: "var(--text-dim)" }}
      >
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}
