import { describe, it, expect } from "vitest";
import { parseInvestmentMessage } from "../investmentParser";

describe("investmentParser", () => {
  it("parses a single ticker", () => {
    const r = parseInvestmentMessage("SPCX 2000");
    expect(r).toHaveLength(1);
    expect(r![0]).toMatchObject({ item: "SPCX", amount: 2000, category: "ลงทุน", type: "รายจ่าย" });
  });

  it("parses multiple tickers", () => {
    const r = parseInvestmentMessage("SPCX 2000 RKLB 5000");
    expect(r!.map((t) => t.item)).toEqual(["SPCX", "RKLB"]);
    expect(r!.map((t) => t.amount)).toEqual([2000, 5000]);
  });

  it("handles comma amounts", () => {
    expect(parseInvestmentMessage("PTT 15,000")![0].amount).toBe(15000);
  });

  it("handles decimal amounts", () => {
    expect(parseInvestmentMessage("BTC 1.5")![0].amount).toBe(1.5);
  });

  it("ignores Thai text", () => {
    expect(parseInvestmentMessage("กินข้าว 80")).toBeNull();
  });

  it("ignores mixed Thai + ticker", () => {
    expect(parseInvestmentMessage("ซื้อ SPCX 2000")).toBeNull();
  });

  it("ignores lowercase text", () => {
    expect(parseInvestmentMessage("spcx 2000")).toBeNull();
  });

  it("blocklists service words", () => {
    expect(parseInvestmentMessage("GRAB 80")).toBeNull();
    expect(parseInvestmentMessage("BTS 50")).toBeNull();
    expect(parseInvestmentMessage("TRUE 599")).toBeNull();
    expect(parseInvestmentMessage("AIS 399")).toBeNull();
    expect(parseInvestmentMessage("MRT 40")).toBeNull();
  });

  it("allows real tickers that overlap with brands", () => {
    expect(parseInvestmentMessage("PTT 500")).not.toBeNull();
    expect(parseInvestmentMessage("CP 1000")).not.toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseInvestmentMessage("")).toBeNull();
  });

  it("returns null for plain number", () => {
    expect(parseInvestmentMessage("2000")).toBeNull();
  });
});
