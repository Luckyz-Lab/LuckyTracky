export const COPY = {
  // Dashboard
  dashboardTitle: "แดชบอร์ด",
  dashboardSubtitle: "ภาพรวมการเงินของเธอ",
  incomeLabel: "รายรับ",
  expenseLabel: "รายจ่าย",
  balanceLabel: "เงินเหลือ",
  savingsRate: (pct: number) => `เก็บได้ ${pct}% ของรายได้`,
  noIncomeYet: "ยังไม่มีรายได้เดือนนี้",

  // Daily widget
  dailyRemaining: (amount: string) => `วันนี้ใช้ได้อีก ${amount}`,
  dailyOverspent: "วันนี้ใช้เกินแล้วน้าา ~",
  dailyEmpty: "วันนี้ยังไม่มีรายจ่ายเลย เก่งมาก! 🎉",

  // Mascot status
  mascotRich: "น้องอิ่มหนำสำราญ มีออร่าสีทอง ✨",
  mascotOk: "น้องสบายดี เงินยังเหลือเฟือ",
  mascotTight: "น้องเริ่มเหงื่อตก ใกล้หมดแล้วนะ",
  mascotBroke: "แงงง ช็อตแล้วเมี้ยว! 🙀",

  // Empty states
  emptyTransactions: "วันนี้ไม่มีใช้จ่ายเลย เก่งมาก!",
  emptyBudgets: "ยังไม่ได้ตั้งงบประมาณเลยน้า ~",
  emptySavings: "ยังไม่มีเป้าหมายออมเงิน เริ่มเลยมั้ย?",

  // Budget
  budgetOver: "แงงง ช็อตแล้วเมี้ยว! 🙀",
  budgetWarning: "ใกล้เต็มแล้ว ระวังหน่อยนะ",

  // Savings
  savingsFeed: "ให้อาหารน้องแมว",
  savingsComplete: "น้องอ้วนตุ๊บแล้ว! ใส่ชุดใหม่เลย ~ 🎊",

  // Transactions
  transactionAdd: "เพิ่มรายการใหม่",
  transactionIncome: "เงินเข้า",
  transactionExpense: "เงินออก",

  // General
  loading: "กำลังโหลด...",
  error: "เกิดข้อผิดพลาด ลองใหม่นะ",
  noData: "ยังไม่มีข้อมูล",

  // Cat paw FAB
  fabLabel: "เพิ่มรายการ",

  // Sound
  soundOn: "เปิดเสียง",
  soundOff: "ปิดเสียง",
} as const;

export function dailyRemainingText(remaining: number, currency: string): string {
  if (remaining > 0) {
    return `วันนี้ใช้ได้อีก ${formatMoneyCopy(remaining, currency)}`;
  }
  if (remaining === 0) {
    return "วันนี้หมดเกลี้ยงเป๊ะ!";
  }
  return "วันนี้ใช้เกินแล้วน้าา ~ 😿";
}

function formatMoneyCopy(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}
