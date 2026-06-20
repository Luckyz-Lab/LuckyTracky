"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { getCategoryFill } from "@/lib/category-colors";

export function DonutChart({ data }: { data: { category: string; amount: number }[] }) {
  if (!data.length) {
    return <p className="py-8 text-center text-sm text-slate-400">No data</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="category"
          innerRadius={62}
          outerRadius={92}
          paddingAngle={3}
          stroke="rgb(var(--ui-surface))"
          strokeWidth={3}
        >
          {data.map((entry) => (
            <Cell key={entry.category} fill={getCategoryFill(entry.category)} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: number) => v.toLocaleString()}
          contentStyle={{
            borderRadius: 12,
            background: "rgb(var(--ui-surface))",
            color: "rgb(var(--ui-text))",
            border: "1px solid rgb(var(--ui-border))",
            boxShadow: "var(--ui-card-shadow)",
            fontSize: 12,
          }}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: "rgb(var(--ui-text-muted))", paddingTop: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TrendChart({
  data,
}: {
  data: { month: string; income: number; expense: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--ui-border))" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "rgb(var(--ui-text-muted))" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "rgb(var(--ui-text-muted))" }} axisLine={false} tickLine={false} />
        <Tooltip formatter={(v: number) => v.toLocaleString()} contentStyle={{ background: "rgb(var(--ui-surface))", color: "rgb(var(--ui-text))", border: "1px solid rgb(var(--ui-border))", borderRadius: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12, color: "rgb(var(--ui-text-muted))" }} />
        <Bar dataKey="income" name="Income" fill="rgb(var(--ui-success))" radius={[6, 6, 0, 0]} />
        <Bar dataKey="expense" name="Expense" fill="rgb(var(--ui-danger))" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
