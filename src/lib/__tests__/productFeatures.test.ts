import { describe, expect, it } from "vitest";
import { monthlyEquivalent, nextRecurringDate } from "../recurring";
import { unlockedAchievementKeys } from "../achievements";
import { contrastRatio, effectiveThemeId, sanitizeThemeOverrides, themeVariables, THEME_PRESETS } from "../theme";

describe("recurring schedules", () => {
  it("advances weekly, monthly and yearly schedules", () => {
    expect(nextRecurringDate("2026-06-19", "weekly")).toBe("2026-06-26");
    expect(nextRecurringDate("2026-06-19", "monthly")).toBe("2026-07-19");
    expect(nextRecurringDate("2026-06-19", "yearly")).toBe("2027-06-19");
  });

  it("normalizes schedules into a monthly projection", () => {
    expect(monthlyEquivalent(1200, "monthly")).toBe(1200);
    expect(monthlyEquivalent(1200, "yearly")).toBe(100);
    expect(monthlyEquivalent(300, "weekly")).toBe(1300);
  });
});

describe("achievement rules", () => {
  it("unlocks only milestones supported by household data", () => {
    const keys = unlockedAchievementKeys({
      transactionCount: 10,
      categoryCount: 4,
      budgetCount: 1,
      goalCount: 1,
      completedGoalCount: 0,
      totalSaved: 5000,
      assistantEntryCount: 5,
    });
    expect(keys).toEqual(expect.arrayContaining(["first-entry", "steady-tracker", "money-map", "budget-keeper", "goal-setter", "savings-streak", "assistant-friend"]));
    expect(keys).not.toContain("goal-finisher");
  });
});

describe("workspace themes", () => {
  it("ships complete accessible presets", () => {
    expect(THEME_PRESETS).toHaveLength(5);
    for (const preset of THEME_PRESETS) {
      expect(contrastRatio(preset.palette.text, preset.palette.surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(preset.palette.primary, preset.palette.onPrimary)).toBeGreaterThanOrEqual(4.5);
      expect(themeVariables(preset.id)["--ui-primary"]).toMatch(/^\d+ \d+ \d+$/);
    }
  });

  it("rejects unsafe override shapes", () => {
    expect(sanitizeThemeOverrides({ primary: "red", radius: "huge", shadow: "glow" })).toEqual({
      primary: null,
      canvas: null,
      surface: null,
      text: null,
      radius: "soft",
      shadow: "soft",
    });
  });

  it("pairs light presets with a readable dark workspace", () => {
    expect(effectiveThemeId("classic", "dark")).toBe("midnight");
    expect(effectiveThemeId("calico", "system", true)).toBe("black-cat");
    expect(effectiveThemeId("midnight", "light")).toBe("siamese");
  });
});
