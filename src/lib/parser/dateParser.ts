/**
 * Thai date parser. Ported from `src/utils/dateParser.js`.
 * Converts Thai date words to YYYY-MM-DD (Bangkok timezone, UTC+7).
 */

function getThaiDate(offsetDays = 0): string {
  const now = new Date();
  const thaiTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  thaiTime.setUTCDate(thaiTime.getUTCDate() + offsetDays);
  return formatDate(thaiTime);
}

export function formatDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getToday(): string {
  return getThaiDate(0);
}

export function getYesterday(): string {
  return getThaiDate(-1);
}

export function parseDateFromText(text: string): string | null {
  const lowerText = text.toLowerCase();

  if (lowerText.includes("วันนี้")) return getToday();
  if (lowerText.includes("เมื่อวาน")) return getYesterday();
  if (lowerText.includes("พรุ่งนี้")) return getThaiDate(1);

  const slashMatch = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const dashMatch = text.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
  if (dashMatch) {
    const [, day, month, year] = dashMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return null;
}

export function isValidDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    !Number.isNaN(date.getTime()) &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
  );
}
