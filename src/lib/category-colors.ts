export interface CategoryTone {
  bg: string;
  border: string;
  text: string;
  dot: string;
  fill: string;
}

// "Cozy Clay" harmonized warm family (Color Set 018) — every tone shares the
// same warm, muted profile (soft bg, gentle border, readable text, dusty fill)
// so categories read as one cohesive terracotta/taupe palette, never clashing.
const CATEGORY_TONES: CategoryTone[] = [
  { bg: "#fbedea", border: "#f0d0cc", text: "#a14a3f", dot: "#e6a9a3", fill: "#e6a9a3" }, // terracotta
  { bg: "#faeae7", border: "#eec6bf", text: "#9e4034", dot: "#c57168", fill: "#c57168" }, // brick
  { bg: "#fbf1e2", border: "#f0dbb8", text: "#8a5e1a", dot: "#d9a45b", fill: "#d9a45b" }, // amber
  { bg: "#f3eeec", border: "#ddd0cb", text: "#6e574f", dot: "#9c7f7b", fill: "#9c7f7b" }, // mauve
  { bg: "#eef2ea", border: "#cfdcc6", text: "#4f6543", dot: "#7e9b74", fill: "#7e9b74" }, // sage
  { bg: "#f7efe8", border: "#e4cdb8", text: "#7e5530", dot: "#b98a6e", fill: "#b98a6e" }, // caramel
  { bg: "#f7edee", border: "#e3cace", text: "#8c5258", dot: "#c99ca0", fill: "#c99ca0" }, // rose-taupe
  { bg: "#f3f0ea", border: "#dbd3c2", text: "#665b43", dot: "#a89178", fill: "#a89178" }, // khaki
  { bg: "#edf1f3", border: "#cad6dc", text: "#4e626c", dot: "#8fa3b0", fill: "#8fa3b0" }, // dusty slate
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
