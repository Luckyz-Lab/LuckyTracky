export interface CategoryTone {
  bg: string;
  border: string;
  text: string;
  dot: string;
  fill: string;
}

// Distinct pastel tones from the high-fidelity mockup.
const CATEGORY_TONES: CategoryTone[] = [
  { bg: "#fff7ed", border: "#fed7aa", text: "#c2410c", dot: "#f97316", fill: "#f97316" },
  { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", dot: "#3b82f6", fill: "#3b82f6" },
  { bg: "#ecfdf5", border: "#a7f3d0", text: "#047857", dot: "#10b981", fill: "#10b981" },
  { bg: "#fff1f2", border: "#fecdd3", text: "#be123c", dot: "#f43f5e", fill: "#f43f5e" },
  { bg: "#f5f3ff", border: "#ddd6fe", text: "#6d28d9", dot: "#8b5cf6", fill: "#8b5cf6" },
  { bg: "#ecfeff", border: "#a5f3fc", text: "#0e7490", dot: "#06b6d4", fill: "#06b6d4" },
  { bg: "#fffbeb", border: "#fde68a", text: "#b45309", dot: "#f59e0b", fill: "#f59e0b" },
  { bg: "#eef2ff", border: "#c7d2fe", text: "#4338ca", dot: "#6366f1", fill: "#6366f1" },
  { bg: "#f8fafc", border: "#cbd5e1", text: "#475569", dot: "#64748b", fill: "#64748b" },
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

const CATEGORY_EMOJI: Record<string, string> = {
  อาหาร: "🍜", food: "🍜", "ข้าว": "🍚", ชาบู: "🍲", หมูกระทะ: "🥩",
  เครื่องดื่ม: "🧋", กาแฟ: "☕", ชา: "🧉",
  เดินทาง: "🚌", "รถ": "🚗", แท็กซี่: "🚕", bts: "🚈", mrt: "🚇", xing: "🛺",
  ของใช้: "🛍️", ช้อปปิ้ง: "🛒", shopping: "🛒",
  ความบันเทิง: "🎮", เกม: "🎮", หนัง: "🎬", concert: "🎵", ดนตรี: "🎵",
  สุขภาพ: "💊", ยา: "💊", หมอ: "🏥", hospital: "🏥",
  การศึกษา: "📚", เรียน: "📚", "ชีทเรียน": "📄", หนังสือ: "📖",
  ของติ่ง: "🌟", กาชา: "🎰", "ของสะสม": "💿",
  บ้าน: "🏠", ค่าเช่า: "🏠", ไฟฟ้า: "⚡", น้ำ: "💧", internet: "📡",
  สัตว์เลี้ยง: "🐾", แมว: "🐱", หมา: "🐶",
  ท่องเที่ยว: "✈️", travel: "✈️", โรงแรม: "🏨",
  เงินเดือน: "💰", รายได้: "💚", salary: "💰", income: "💚",
  ออม: "🐷", ออมเงิน: "🐷", savings: "🐷",
  อื่นๆ: "📌", other: "📌",
};

export function getCategoryEmoji(category: string | null | undefined): string {
  const key = (category ?? "อื่นๆ").trim().toLowerCase();
  for (const [k, v] of Object.entries(CATEGORY_EMOJI)) {
    if (key.includes(k.toLowerCase())) return v;
  }
  return "📌";
}
