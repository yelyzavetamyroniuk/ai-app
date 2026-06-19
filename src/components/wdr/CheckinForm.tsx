"use client";

import { useState } from "react";
import type { WDRAnalysis } from "@/types";
import { DamageReport } from "./DamageReport";

const MOODS = [
  { value: 0, emoji: "😫", label: "Жахливо" },
  { value: 1, emoji: "😕", label: "Погано" },
  { value: 2, emoji: "😐", label: "Нормально" },
  { value: 3, emoji: "😀", label: "Добре" },
  { value: 4, emoji: "😃", label: "Чудово" },
];

const STRESS_LEVELS = [
  { value: "Спокійно", emoji: "😌" },
  { value: "Нормально", emoji: "🙂" },
  { value: "Напружено", emoji: "😤" },
  { value: "Тривожно", emoji: "😰" },
  { value: "Перевантаження", emoji: "🤯" },
  { value: "Критично", emoji: "😵" },
];

const ANNOYANCES = [
  { value: "🧑‍💼 Комунікація з командою", emoji: "🧑‍💼", label: "Комунікація з командою" },
  { value: "📅 Багато зустрічей", emoji: "📅", label: "Багато зустрічей" },
  { value: "📊 Пріоритети та дедлайни", emoji: "📊", label: "Пріоритети та дедлайни" },
  { value: "🐞 Неочікувані проблеми", emoji: "🐞", label: "Неочікувані проблеми" },
  { value: "🏠 Особисті справи", emoji: "🏠", label: "Особисті справи" },
  { value: "🎯 Фокус мод", emoji: "🎯", label: "Фокус мод" },
  { value: "🤷 Важко сказати", emoji: "🤷", label: "Важко сказати" },
  { value: "🔥 Все одразу", emoji: "🔥", label: "Все одразу" },
];

function distractionsLabel(val: number): string {
  const labels = [
    "Не відволікали 🌿",
    "Раз або два",
    "Кілька разів",
    "Досить часто",
    "Постійно",
    "Часто",
    "Складно рахувати",
    "Майже без перерв",
    "Хаос",
    "Критично",
    "Не дали навіть пообідати 🤯",
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
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<WDRAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
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
        setError("Потрібно увійти через GitHub, щоб генерувати звіти.");
        return;
      }
      if (!res.ok) {
        setError("Щось пішло не так. Спробуй ще раз.");
        return;
      }

      const data = await res.json();
      setResult(data.analysis);
    } catch {
      setError("Помилка з'єднання. Перевір інтернет і спробуй знову.");
    } finally {
      setIsLoading(false);
    }
  }

  if (result) {
    return (
      <div className="space-y-6">
        <DamageReport analysis={result} />
        <button
          onClick={() => setResult(null)}
          className="w-full py-3 rounded-xl text-sm font-medium transition-all"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
          }}
        >
          ← Новий чекін
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 1. Mood */}
      <FormCard>
        <Question num={1} text="Як ти сьогодні?" />
        <div className="flex justify-between gap-2">
          {MOODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setField("mood", m.value)}
              className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all text-2xl sm:text-3xl"
              style={{
                backgroundColor: form.mood === m.value ? "var(--accent-glow)" : "var(--bg-card-2)",
                border: `1px solid ${form.mood === m.value ? "var(--border-accent)" : "var(--border)"}`,
                transform: form.mood === m.value ? "scale(1.08)" : "scale(1)",
              }}
              title={m.label}
            >
              {m.emoji}
              <span className="hidden sm:block text-xs" style={{ color: "var(--text-muted)", fontSize: "10px" }}>
                {m.label}
              </span>
            </button>
          ))}
        </div>
      </FormCard>

      {/* 2. Sleep */}
      <FormCard>
        <Question num={2} text="Скільки годин спав/ла?" />
        <SliderField
          value={form.sleepHours}
          min={0}
          max={10}
          step={0.5}
          onChange={(v) => setField("sleepHours", v)}
          leftLabel="0 год"
          rightLabel="10+ год"
          displayValue={`${form.sleepHours} год`}
        />
      </FormCard>

      {/* 3. Meetings */}
      <FormCard>
        <Question num={3} text="Скільки зустрічей було сьогодні?" />
        <SliderField
          value={form.meetings}
          min={0}
          max={8}
          step={1}
          onChange={(v) => setField("meetings", v)}
          leftLabel="0"
          rightLabel="8+"
          displayValue={form.meetings === 0 ? "Жодної 🙌" : form.meetings >= 8 ? "8+ 😱" : `${form.meetings}`}
        />
      </FormCard>

      {/* 4. Work hours */}
      <FormCard>
        <Question num={4} text="Скільки годин працював/ла?" />
        <SliderField
          value={form.workHours}
          min={0}
          max={12}
          step={0.5}
          onChange={(v) => setField("workHours", v)}
          leftLabel="0 год"
          rightLabel="12+ год"
          displayValue={`${form.workHours} год`}
        />
      </FormCard>

      {/* 5. Distractions */}
      <FormCard>
        <Question num={5} text="Скільки разів тебе відволікали?" />
        <SliderField
          value={form.distractions}
          min={0}
          max={10}
          step={1}
          onChange={(v) => setField("distractions", v)}
          leftLabel="Не відволікали"
          rightLabel="Не дали пообідати"
          displayValue={distractionsLabel(form.distractions)}
        />
      </FormCard>

      {/* 6. Stress */}
      <FormCard>
        <Question num={6} text="Рівень стресу:" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {STRESS_LEVELS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setField("stressLevel", s.value)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all"
              style={{
                backgroundColor: form.stressLevel === s.value ? "var(--accent-glow)" : "var(--bg-card-2)",
                border: `1px solid ${form.stressLevel === s.value ? "var(--border-accent)" : "var(--border)"}`,
                color: "var(--text)",
              }}
            >
              <span className="text-lg">{s.emoji}</span>
              <span style={{ color: form.stressLevel === s.value ? "var(--accent-2)" : "var(--text)" }}>
                {s.value}
              </span>
            </button>
          ))}
        </div>
      </FormCard>

      {/* 7. Annoyances */}
      <FormCard>
        <Question num={7} text="Що найбільше вплинуло на твій день?" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ANNOYANCES.map((a) => {
            const selected = form.annoyances.includes(a.value);
            return (
              <button
                key={a.value}
                type="button"
                onClick={() => toggleAnnoyance(a.value)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-all"
                style={{
                  backgroundColor: selected ? "var(--accent-glow)" : "var(--bg-card-2)",
                  border: `1px solid ${selected ? "var(--border-accent)" : "var(--border)"}`,
                  color: selected ? "var(--accent-2)" : "var(--text)",
                }}
              >
                <span className="text-base">{a.emoji}</span>
                {a.label}
                {selected && <span className="ml-auto text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      </FormCard>

      {/* 8. Comment */}
      <FormCard>
        <Question num={8} text="Коментар (необов'язково)" />
        <textarea
          value={form.comment}
          onChange={(e) => setField("comment", e.target.value)}
          placeholder="Що ще хочеш додати про свій день?"
          rows={3}
          maxLength={500}
          className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all"
          style={{
            backgroundColor: "var(--bg-input)",
            border: "1px solid var(--border)",
            color: "var(--text)",
          }}
          onFocus={(e) => { e.target.style.borderColor = "var(--border-accent)"; }}
          onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
        />
        <p className="text-right text-xs mt-1" style={{ color: "var(--text-dim)" }}>
          {form.comment.length}/500
        </p>
      </FormCard>

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            backgroundColor: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "var(--red)",
          }}
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 rounded-2xl text-base font-semibold transition-all disabled:opacity-60"
        style={{
          backgroundColor: "var(--accent)",
          color: "white",
          boxShadow: isLoading ? "none" : "0 0 24px rgba(124,106,255,0.35)",
        }}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            Аналізую твій день...
          </span>
        ) : (
          "🔍 Згенерувати Damage Report"
        )}
      </button>
    </form>
  );
}

function FormCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5 space-y-4 card-glow"
      style={{ backgroundColor: "var(--bg-card)" }}
    >
      {children}
    </div>
  );
}

function Question({ num, text }: { num: number; text: string }) {
  return (
    <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
      <span
        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-2"
        style={{ backgroundColor: "var(--accent-glow)", color: "var(--accent-2)" }}
      >
        {num}
      </span>
      {text}
    </p>
  );
}

function SliderField({
  value,
  min,
  max,
  step,
  onChange,
  leftLabel,
  rightLabel,
  displayValue,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  leftLabel: string;
  rightLabel: string;
  displayValue: string;
}) {
  return (
    <div className="space-y-2">
      <div className="text-center">
        <span
          className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
          style={{
            backgroundColor: "var(--accent-glow)",
            color: "var(--accent-2)",
            border: "1px solid var(--border-accent)",
          }}
        >
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}
