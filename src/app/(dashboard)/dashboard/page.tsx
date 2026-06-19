import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { DashboardContent } from "@/components/wdr/DashboardContent";
import type { MoodEntryDisplay, DashboardMetrics, DashboardInsight } from "@/types";

const vt = { fontFamily: "var(--font-vt323), 'Courier New', monospace" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const rawEntries = await prisma.moodEntry.findMany({
    where: {
      userId: session.user.id,
      createdAt: { gte: thirtyDaysAgo },
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  const entries: MoodEntryDisplay[] = rawEntries.map((e) => ({
    id: e.id,
    createdAt: e.createdAt.toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "short",
    }),
    mood: e.mood,
    damageScore: e.damageScore,
    culprit: e.culprit,
    mainFactor: (e.aiAnalysis as { mainFactor?: string })?.mainFactor ?? "",
    sleepHours: e.sleepHours,
    meetings: e.meetings,
    workHours: e.workHours,
    distractions: e.distractions,
    stressLevel: e.stressLevel,
    annoyances: e.annoyances,
  }));

  const metrics = computeMetrics(entries);
  const showWarning = checkWarningBanner(entries);
  const meetingsCounter = entries.filter((e) =>
    e.annoyances.some((a) => a.includes("Багато зустрічей"))
  ).length;
  const insights = computeInsights(entries, metrics);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 pb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-pixel" style={{ fontSize: "14px", color: "var(--text)", lineHeight: 2 }}>
            DASHBOARD
          </h1>
          <p style={{ ...vt, fontSize: "20px", color: "var(--text-muted)", marginTop: "2px" }}>
            Останні 30 днів · {session.user.name ?? session.user.email}
          </p>
        </div>
        <Link href="/" className="pixel-btn pixel-btn-cta" style={{ fontSize: "10px", padding: "10px 20px" }}>
          + CHECKIN
        </Link>
      </div>
      <DashboardContent
        entries={entries}
        metrics={metrics}
        showWarning={showWarning}
        meetingsCounter={meetingsCounter}
        insights={insights}
      />
    </main>
  );
}

function computeMetrics(entries: MoodEntryDisplay[]): DashboardMetrics {
  if (entries.length === 0) {
    return { avgMood: 2, avgSleep: 7, avgDamageScore: 0, topAnnoyances: [] };
  }

  const avgMood = entries.reduce((s, e) => s + e.mood, 0) / entries.length;
  const avgSleep = entries.reduce((s, e) => s + e.sleepHours, 0) / entries.length;
  const avgDamageScore = entries.reduce((s, e) => s + e.damageScore, 0) / entries.length;

  const annoyanceCounts: Record<string, number> = {};
  for (const e of entries) {
    for (const a of e.annoyances) {
      annoyanceCounts[a] = (annoyanceCounts[a] ?? 0) + 1;
    }
  }

  const topAnnoyances = Object.entries(annoyanceCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  return { avgMood, avgSleep, avgDamageScore, topAnnoyances };
}

function checkWarningBanner(entries: MoodEntryDisplay[]): boolean {
  const recent = entries.slice(0, 3);
  return recent.length === 3 && recent.every((e) => e.mood <= 1);
}

function computeInsights(entries: MoodEntryDisplay[], metrics: DashboardMetrics): DashboardInsight[] {
  if (entries.length < 5) return [];
  const insights: string[] = [];

  const goodSleep = entries.filter((e) => e.sleepHours > 7);
  const badSleep = entries.filter((e) => e.sleepHours <= 7);
  if (goodSleep.length > 1 && badSleep.length > 1) {
    const avgGood = goodSleep.reduce((s, e) => s + e.mood, 0) / goodSleep.length;
    const avgBad = badSleep.reduce((s, e) => s + e.mood, 0) / badSleep.length;
    if (avgGood > avgBad + 0.3) {
      insights.push("У дні, коли ти спиш понад 7 годин, твій середній настрій помітно вищий.");
    }
  }

  if (metrics.topAnnoyances.length > 0) {
    const top = metrics.topAnnoyances[0];
    const pct = Math.round((top.count / entries.length) * 100);
    insights.push(`Найчастіше джерело навантаження — ${top.name} (${pct}% днів).`);
  }

  const highDist = entries.filter((e) => e.distractions > 5);
  const lowDist = entries.filter((e) => e.distractions <= 5);
  if (highDist.length > 1 && lowDist.length > 1) {
    const avgHigh = highDist.reduce((s, e) => s + e.damageScore, 0) / highDist.length;
    const avgLow = lowDist.reduce((s, e) => s + e.damageScore, 0) / lowDist.length;
    if (avgLow < avgHigh - 10) {
      insights.push("У дні з меншою кількістю відволікань Damage Score стабільно нижчий.");
    }
  }

  const highMeetings = entries.filter((e) => e.meetings >= 4);
  if (highMeetings.length > 2) {
    const avgDmg = highMeetings.reduce((s, e) => s + e.damageScore, 0) / highMeetings.length;
    if (avgDmg > metrics.avgDamageScore + 15) {
      insights.push(`Дні з 4+ зустрічами дають Damage Score на ~${Math.round(avgDmg - metrics.avgDamageScore)} пунктів вищий.`);
    }
  }

  return insights;
}
