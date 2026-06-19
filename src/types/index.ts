export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type ChatRequest = {
  messages: Message[];
};

export type WDRFactor = {
  name: string;
  percentage: number;
  emoji?: string;
};

export type WDRAnalysis = {
  factors: WDRFactor[];
  damageScore: number;
  mainFactor: string;
  culprit: string;
  recommendations: string[];
  actionType: "focus" | "priority" | "recovery" | "boundaries";
  slackMessage: string;
};

export type CheckinFormData = {
  mood: number;
  sleepHours: number;
  meetings: number;
  workHours: number;
  distractions: number;
  stressLevel: string;
  annoyances: string[];
  comment?: string;
};

export type AnalyzeResponse = {
  id: string;
  analysis: WDRAnalysis;
};

export type MoodEntryDisplay = {
  id: string;
  createdAt: string;
  mood: number;
  damageScore: number;
  culprit: string;
  mainFactor: string;
  sleepHours: number;
  meetings: number;
  workHours: number;
  distractions: number;
  stressLevel: string;
  annoyances: string[];
};

export type DashboardMetrics = {
  avgMood: number;
  avgSleep: number;
  avgDamageScore: number;
  topAnnoyances: Array<{ name: string; count: number }>;
};

export type DashboardInsight = string;
