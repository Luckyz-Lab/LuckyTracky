import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getHouseholdContext } from "@/lib/household";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const ctx = await getHouseholdContext();
  if (!ctx || !ctx.activeHousehold) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");

  const supabase = createClient();
  let query = supabase
    .from("transactions")
    .select("date, item, amount, type, category_name, source, created_at")
    .eq("household_id", ctx.activeHousehold.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
    query = query.gte("date", `${month}-01`).lte("date", `${month}-${String(last).padStart(2, "0")}`);
  }

  const { data } = await query;

  const rows = (data ?? []).map((tx) => ({
    Date: tx.date,
    Item: tx.item,
    Amount: tx.amount,
    Type: tx.type === "income" ? "Income" : "Expense",
    Category: tx.category_name ?? "",
    Source: tx.source ?? "",
    Created: tx.created_at,
  }));

  const header = Object.keys(rows[0] ?? {}).join(",");
  const csv = [header, ...rows.map((r) => Object.values(r).map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="transactions${month ? `-${month}` : ""}.csv"`,
    },
  });
}
