import { describe, it, expect } from "vitest";
import { extractAmount, cleanTransactionItem, parseAmountValue } from "../moneyParser";
import { classifyByKeyword, categorizeByKeyword } from "../categories";
import { isAmbiguousTransactionText, shouldAutoSaveTransaction } from "../transactionRules";
import { isValidDate, parseDateFromText } from "../dateParser";
import type { ParsedTransaction } from "../types";

describe("moneyParser", () => {
  it("extracts plain amounts", () => {
    expect(extractAmount("กินข้าว 80")).toBe(80);
    expect(extractAmount("เงินเดือน 25,000")).toBe(25000);
    expect(extractAmount("กาแฟ 45 บาท")).toBe(45);
  });

  it("returns null when there is no amount", () => {
    expect(extractAmount("กินข้าว")).toBeNull();
  });

  it("parses amount values defensively", () => {
    expect(parseAmountValue("1,200")).toBe(1200);
    expect(parseAmountValue("-5")).toBeNull();
  });

  it("cleans the item text", () => {
    expect(cleanTransactionItem("กินข้าว 80")).toBe("ข้าว");
    expect(cleanTransactionItem("ค่าแท็กซี่ 150")).toBe("ค่าแท็กซี่");
  });
});

describe("classification", () => {
  it("detects income vs expense", () => {
    expect(classifyByKeyword("เงินเดือน 25000")).toBe("รายรับ");
    expect(classifyByKeyword("กินข้าว 80")).toBe("รายจ่าย");
  });

  it("maps to a category", () => {
    expect(categorizeByKeyword("กาแฟ 45", "รายจ่าย")).toBe("อาหาร");
    expect(categorizeByKeyword("เงินเดือน 25000", "รายรับ")).toBe("เงินเดือน");
  });
});

describe("transactionRules", () => {
  it("flags ambiguous transfers", () => {
    expect(isAmbiguousTransactionText("โอน 500")).toBe(true);
    expect(isAmbiguousTransactionText("เงิน 800")).toBe(true);
    expect(isAmbiguousTransactionText("กินข้าว 80")).toBe(false);
  });

  it("auto-saves obvious transactions", () => {
    const parsed: ParsedTransaction = {
      item: "ข้าว",
      amount: 80,
      category: "อาหาร",
      type: "รายจ่าย",
      date: "2025-01-01",
      confidence: 0.95,
      missing_fields: [],
    };
    expect(shouldAutoSaveTransaction(parsed, "กินข้าว 80")).toBe(true);
  });

  it("does not auto-save ambiguous transactions", () => {
    const parsed: ParsedTransaction = {
      item: "โอน",
      amount: 500,
      category: "อื่นๆ",
      type: "รายจ่าย",
      date: "2025-01-01",
      confidence: 0.4,
      missing_fields: [],
    };
    expect(shouldAutoSaveTransaction(parsed, "โอน 500")).toBe(false);
  });
});

describe("dateParser", () => {
  it("validates dates", () => {
    expect(isValidDate("2025-01-15")).toBe(true);
    expect(isValidDate("2025-13-40")).toBe(false);
  });

  it("parses DD/MM/YYYY", () => {
    expect(parseDateFromText("ค่าน้ำ 300 15/01/2025")).toBe("2025-01-15");
  });
});
