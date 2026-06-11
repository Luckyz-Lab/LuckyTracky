import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/dashboard";
import { formatMoney } from "@/lib/utils";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { household_id, month } = await request.json();
  if (!household_id || !month) {
    return NextResponse.json({ error: "household_id and month required" }, { status: 400 });
  }

  const data = await getDashboardData(supabase, household_id, month);

  const facts = [
    `Month: ${month}`,
    `Income: ${formatMoney(data.income)}`,
    `Expense: ${formatMoney(data.expense)}`,
    `Balance: ${formatMoney(data.balance)}`,
    `Expenses by category: ${data.expenseByCategory.map((c) => `${c.category} ${c.amount}`).join(", ") || "none"}`,
    `Budgets: ${data.budgets.map((b) => `${b.category} ${b.pct}%`).join(", ") || "none"}`,
  ].join("\n");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ summary: data.insights.join(" ") });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.0-flash" });
    const result = await model.generateContent(
      `You are a friendly personal finance assistant. Based on the following monthly figures, write a short (3-4 sentence) insight in English with one practical suggestion. Be concrete and encouraging.\n\n${facts}`
    );
    return NextResponse.json({ summary: result.response.text() });
  } catch {
    return NextResponse.json({ summary: data.insights.join(" ") });
  }
}
