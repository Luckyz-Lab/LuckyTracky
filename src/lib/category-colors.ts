export interface CategoryTone {
  bg: string;
  border: string;
  text: string;
  dot: string;
  fill: string;
}

const CATEGORY_TONES: CategoryTone[] = [
  { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", dot: "#2563eb", fill: "#2563eb" },
  { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d", dot: "#16a34a", fill: "#16a34a" },
  { bg: "#fff7ed", border: "#fed7aa", text: "#c2410c", dot: "#f97316", fill: "#f97316" },
  { bg: "#fdf2f8", border: "#fbcfe8", text: "#be185d", dot: "#db2777", fill: "#db2777" },
  { bg: "#f5f3ff", border: "#ddd6fe", text: "#6d28d9", dot: "#7c3aed", fill: "#7c3aed" },
  { bg: "#ecfeff", border: "#a5f3fc", text: "#0e7490", dot: "#0891b2", fill: "#0891b2" },
  { bg: "#fefce8", border: "#fde68a", text: "#a16207", dot: "#ca8a04", fill: "#ca8a04" },
  { bg: "#f1f5f9", border: "#cbd5e1", text: "#334155", dot: "#475569", fill: "#475569" },
  { bg: "#fff1f2", border: "#fecdd3", text: "#be123c", dot: "#e11d48", fill: "#e11d48" },
  { bg: "#eef2ff", border: "#c7d2fe", text: "#4338ca", dot: "#4f46e5", fill: "#4f46e5" },
];

function hashCategory(category: string) {
  let hash = 0;
  for (let i = 0; i < category.length; i += 1) {
    hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getCategoryTone(category: string | null | undefined): CategoryTone {
  const key = category?.trim() || "Other";
  return CATEGORY_TONES[hashCategory(key) % CATEGORY_TONES.length];
}

export function getCategoryFill(category: string | null | undefined) {
  return getCategoryTone(category).fill;
}
