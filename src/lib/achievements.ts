import {
  BadgeCheck,
  Bot,
  CircleDollarSign,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";

export interface AchievementDefinition {
  key: string;
  name: string;
  description: string;
  xp: number;
  icon: LucideIcon;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { key: "first-entry", name: "First entry", description: "Record the first household transaction.", xp: 50, icon: ReceiptText },
  { key: "steady-tracker", name: "Steady tracker", description: "Record at least 10 transactions.", xp: 120, icon: BadgeCheck },
  { key: "money-map", name: "Money map", description: "Use at least 4 spending categories.", xp: 100, icon: CircleDollarSign },
  { key: "budget-keeper", name: "Budget keeper", description: "Create a monthly category budget.", xp: 100, icon: ShieldCheck },
  { key: "goal-setter", name: "Goal setter", description: "Create a savings goal.", xp: 80, icon: Target },
  { key: "goal-finisher", name: "Goal finisher", description: "Complete a savings goal.", xp: 250, icon: Sparkles },
  { key: "savings-streak", name: "Savings streak", description: "Save at least THB 5,000 across goals.", xp: 180, icon: PiggyBank },
  { key: "assistant-friend", name: "Assistant friend", description: "Record at least 5 chat or LINE entries.", xp: 120, icon: Bot },
];

export interface AchievementStats {
  transactionCount: number;
  categoryCount: number;
  budgetCount: number;
  goalCount: number;
  completedGoalCount: number;
  totalSaved: number;
  assistantEntryCount: number;
}

export function unlockedAchievementKeys(stats: AchievementStats): string[] {
  const keys: string[] = [];
  if (stats.transactionCount >= 1) keys.push("first-entry");
  if (stats.transactionCount >= 10) keys.push("steady-tracker");
  if (stats.categoryCount >= 4) keys.push("money-map");
  if (stats.budgetCount >= 1) keys.push("budget-keeper");
  if (stats.goalCount >= 1) keys.push("goal-setter");
  if (stats.completedGoalCount >= 1) keys.push("goal-finisher");
  if (stats.totalSaved >= 5000) keys.push("savings-streak");
  if (stats.assistantEntryCount >= 5) keys.push("assistant-friend");
  return keys;
}
