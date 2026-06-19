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
          stroke="#ffffff"
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
            border: "1px solid #f0d0cc",
            boxShadow: "0 12px 28px rgba(117, 99, 89, 0.18)",
            fontSize: 12,
          }}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: "#475569", paddingTop: 12 }} />
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
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
        <Tooltip formatter={(v: number) => v.toLocaleString()} />
        <Legend wrapperStyle={{ fontSize: 12, color: "#475569" }} />
        <Bar dataKey="income" name="Income" fill="#7e9b74" radius={[6, 6, 0, 0]} />
        <Bar dataKey="expense" name="Expense" fill="#c0685e" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
