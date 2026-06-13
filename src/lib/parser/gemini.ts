/**
 * Gemini AI service. Ported from `src/services/geminiService.js`.
 * Parses Thai text (and receipt images) into a structured transaction.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildSystemPrompt, buildUserPrompt, buildReceiptPrompt } from "./prompts";
import { getToday, getYesterday, isValidDate, parseDateFromText } from "./dateParser";
import { ALL_CATEGORIES, categorizeByKeyword, classifyByKeyword } from "./categories";
import { boostConfidenceForObviousTransaction, isAmbiguousTransactionText } from "./transactionRules";
import { cleanTransactionItem, extractAmount, parseAmountValue } from "./moneyParser";
import type { ParsedTransaction } from "./types";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.15,
    },
  });
}

export async function parseExpenseMessage(userMessage: string): Promise<ParsedTransaction> {
  try {
    const today = getToday();
    const yesterday = getYesterday();
    const systemPrompt = buildSystemPrompt(today, yesterday);
    const userPrompt = buildUserPrompt(userMessage);

    const result = await getModel().generateContent({
      contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }],
    });

    const parsed = JSON.parse(result.response.text());
    return sanitizeResult(parsed, userMessage);
  } catch (error) {
    console.error("Gemini AI Error:", (error as Error).message);
    return fallbackParse(userMessage);
  }
}

/**
 * Transcribe a voice note (m4a/aac/mp4 audio from LINE) then parse as a transaction.
 * Gemini multimodal supports audio inline data.
 */
export async function parseVoiceNote(
  base64Audio: string,
  mimeType: string
): Promise<{ transcript: string; parsed: ParsedTransaction }> {
  const today = getToday();
  const result = await getModel().generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Today is ${today}. The audio below is a voice message about a financial transaction in Thai. 
1. Transcribe it exactly.
2. Parse it as a transaction JSON: { item, amount, type ("รายรับ"|"รายจ่าย"), category, date, confidence, missing_fields }.
Return ONLY valid JSON: { "transcript": "...", "item": ..., "amount": ..., "type": ..., "category": ..., "date": ..., "confidence": ..., "missing_fields": [] }`,
          },
          { inlineData: { data: base64Audio, mimeType } },
        ],
      },
    ],
  });
  const raw = JSON.parse(result.response.text());
  const transcript: string = raw.transcript ?? "";
  const parsed = sanitizeResult(raw, transcript || raw.item || "");
  return { transcript, parsed };
}

export async function parseReceiptImage(
  base64Image: string,
  mimeType: string
): Promise<ParsedTransaction> {
  const today = getToday();
  const result = await getModel().generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { text: buildReceiptPrompt(today) },
          { inlineData: { data: base64Image, mimeType } },
        ],
      },
    ],
  });
  const parsed = JSON.parse(result.response.text());
  return sanitizeResult(parsed, parsed.item || "");
}

function sanitizeResult(parsed: any, originalText: string): ParsedTransaction {
  const today = getToday();
  const keywordType = classifyByKeyword(originalText);
  const keywordCategory = categorizeByKeyword(originalText, keywordType);
  const parsedDateFromText = parseDateFromText(originalText);

  if (parsed.amount !== null && parsed.amount !== undefined) {
    parsed.amount = parseAmountValue(parsed.amount);
    if (parsed.amount === null) {
      if (!parsed.missing_fields) parsed.missing_fields = [];
      if (!parsed.missing_fields.includes("amount")) parsed.missing_fields.push("amount");
    }
  } else {
    parsed.amount = extractAmount(originalText);
  }

  if (!["รายรับ", "รายจ่าย"].includes(parsed.type)) {
    parsed.type = keywordType;
    parsed.confidence = Math.min(parsed.confidence || 0.5, 0.6);
  }

  if (!ALL_CATEGORIES.includes(parsed.category)) {
    parsed.category = keywordCategory;
    parsed.confidence = Math.min(parsed.confidence || 0.5, 0.7);
  } else if (keywordCategory !== "อื่นๆ" && parsed.category === "อื่นๆ") {
    parsed.category = keywordCategory;
  }

  if (!parsed.date || !isValidDate(parsed.date)) {
    parsed.date = parsedDateFromText || today;
  }

  if (typeof parsed.confidence !== "number" || parsed.confidence < 0 || parsed.confidence > 1) {
    parsed.confidence = 0.7;
  }

  if (!Array.isArray(parsed.missing_fields)) parsed.missing_fields = [];

  if (parsed.amount === null || parsed.amount === undefined) {
    if (!parsed.missing_fields.includes("amount")) parsed.missing_fields.push("amount");
  }

  if (!parsed.item || String(parsed.item).trim() === "") {
    parsed.item = cleanTransactionItem(originalText);
    if (!parsed.missing_fields.includes("item")) parsed.missing_fields.push("item");
  } else {
    parsed.item = String(parsed.item).trim();
  }

  parsed.missing_fields = parsed.missing_fields.filter((field: string) => {
    if (field === "amount") return parsed.amount === null || parsed.amount === undefined;
    if (field === "item") return !parsed.item;
    if (field === "type") return !["รายรับ", "รายจ่าย"].includes(parsed.type);
    if (field === "category") return !ALL_CATEGORIES.includes(parsed.category);
    return true;
  });

  if (isAmbiguousTransactionText(originalText)) {
    parsed.confidence = Math.min(parsed.confidence, 0.45);
  }

  return boostConfidenceForObviousTransaction(parsed as ParsedTransaction, originalText);
}

function fallbackParse(text: string): ParsedTransaction {
  const today = getToday();
  const amount = extractAmount(text);
  const item = cleanTransactionItem(text);
  const type = classifyByKeyword(text);
  const category = categorizeByKeyword(text, type);

  const missing_fields: string[] = [];
  if (amount === null) missing_fields.push("amount");
  if (item === null) missing_fields.push("item");

  return {
    item,
    amount,
    category,
    type,
    date: parseDateFromText(text) || today,
    confidence: isAmbiguousTransactionText(text) ? 0.35 : 0.88,
    missing_fields,
    reply_hint: "ใช้ fallback parser",
  };
}
