import type { SupabaseClient } from "@supabase/supabase-js";
import type { Transaction, Budget } from "@/lib/supabase/types";

export interface CategoryBreakdown {
  category: string;
  amount: number;
}

export interface BudgetStatus {
  category: string;
  categoryId: string | null;
  limit: number;
  spent: number;
  pct: number;
}

export interface DashboardData {
  month: string;
  income: number;
  expense: number;
  balance: number;
  expenseByCategory: CategoryBreakdown[];
  incomeBySource: CategoryBreakdown[];
  budgets: BudgetStatus[];
  recent: Transaction[];
  insights: string[];
}

function monthRange(month: string): { from: string; to: string } {
  const [y, m] = month.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { from: `${month}-01`, to: `${month}-${String(last).padStart(2, "0")}` };
}

export async function getDashboardData(
  supabase: SupabaseClient,
  householdId: string,
  month: string
): Promise<DashboardData> {
  const { from, to } = monthRange(month);

  const [{ data: txData }, { data: budgetData }, { data: recentData }] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .eq("household_id", householdId)
      .gte("date", from)
      .lte("date", to),
    supabase.from("budgets").select("*").eq("household_id", householdId).eq("month", month),
    supabase
      .from("transactions")
      .select("*")
      .eq("household_id", householdId)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const txs = (txData ?? []) as Transaction[];
  const budgets = (budgetData ?? []) as Budget[];

  let income = 0;
  let expense = 0;
  const expenseByCat: Record<string, number> = {};
  const incomeByCat: Record<string, number> = {};

  for (const t of txs) {
    const amt = Number(t.amount);
    const cat = t.category_name ?? "อื่นๆ";
    if (t.type === "income") {
      income += amt;
      incomeByCat[cat] = (incomeByCat[cat] ?? 0) + amt;
    } else {
      expense += amt;
      expenseByCat[cat] = (expenseByCat[cat] ?? 0) + amt;
    }
  }

  const expenseByCategory = Object.entries(expenseByCat)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const incomeBySource = Object.entries(incomeByCat)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const budgetStatus: BudgetStatus[] = budgets.map((b) => {
    const catName = txs.find((t) => t.category_id === b.category_id)?.category_name ?? "Category";
    const spent = expenseByCat[catName] ?? 0;
    return {
      category: catName,
      categoryId: b.category_id,
      limit: Number(b.limit_amount),
      spent,
      pct: b.limit_amount ? Math.round((spent / Number(b.limit_amount)) * 100) : 0,
    };
  });

  // Rule-based insights
  const insights: string[] = [];
  if (expense > income && income > 0) {
    insights.push(`You spent more than you earned this month (${Math.round((expense / income) * 100)}% of income).`);
  }
  for (const b of budgetStatus) {
    if (b.pct >= 100) insights.push(`Over budget on ${b.category} (${b.pct}% of limit).`);
    else if (b.pct >= 85) insights.push(`Approaching budget on ${b.category} (${b.pct}% used).`);
  }
  if (expenseByCategory[0]) {
    insights.push(`Top spending category: ${expenseByCategory[0].category}.`);
  }
  if (!insights.length && txs.length === 0) {
    insights.push("No transactions yet this month. Add one from the chat panel.");
  }

  return {
    month,
    income,
    expense,
    balance: income - expense,
    expenseByCategory,
    incomeBySource,
    budgets: budgetStatus,
    recent: (recentData ?? []) as Transaction[],
    insights,
  };
}
