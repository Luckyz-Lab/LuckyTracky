import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const householdId = searchParams.get("household_id");
  const format = searchParams.get("format") ?? "csv";
  if (!householdId) return NextResponse.json({ error: "household_id required" }, { status: 400 });

  const { data, error } = await supabase
    .from("transactions")
    .select("date, item, type, category_name, amount, currency, source")
    .eq("household_id", householdId)
    .order("date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []).map((t) => ({
    Date: t.date,
    Item: t.item,
    Type: t.type,
    Category: t.category_name,
    Amount: Number(t.amount),
    Currency: t.currency,
    Source: t.source,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

  if (format === "xlsx") {
    const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="transactions.xlsx"`,
      },
    });
  }

  const csv = XLSX.utils.sheet_to_csv(worksheet);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="transactions.csv"`,
    },
  });
}
