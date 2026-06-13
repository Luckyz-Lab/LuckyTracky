import { NextResponse } from "next/server";

/**
 * POST /api/line/rich-menu
 * Creates a default rich menu for the LINE bot.
 * Run once via curl or browser to set up the persistent chat menu.
 *
 * After creating, upload a 2500×1686 or 1200×810 PNG image via:
 *   curl -X POST https://api.line.me/v2/bot/richmenu/{richMenuId}/content \
 *     -H "Authorization: Bearer {token}" \
 *     -H "Content-Type: image/png" \
 *     --data-binary @menu.png
 */

const RICH_MENU_API = "https://api.line.me/v2/bot/richmenu";

interface RichMenuArea {
  bounds: { x: number; y: number; width: number; height: number };
  action: { type: string; label?: string; text?: string; data?: string; displayText?: string };
}

function buildRichMenu(): { size: { width: number; height: number }; selected: boolean; name: string; chatBarText: string; areas: RichMenuArea[] } {
  // 6-panel layout (2 rows × 3 cols) on a 2500×1686 canvas
  const W = 2500;
  const H = 1686;
  const cols = 3;
  const rows = 2;
  const cw = Math.floor(W / cols);
  const rh = Math.floor(H / rows);

  const panels = [
    { label: "📊 Summary", text: "สรุป" },
    { label: "➕ Add Expense", text: "บันทึกรายจ่าย" },
    { label: "💰 Add Income", text: "บันทึกรายรับ" },
    { label: "📸 Scan Receipt", text: "สแกนสลิป" },
    { label: "📈 Budget", text: "งบประมาณ" },
    { label: "📋 Report", text: "รายงาน" },
  ];

  const areas: RichMenuArea[] = panels.map((p, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      bounds: { x: col * cw, y: row * rh, width: cw, height: rh },
      action: { type: "message", label: p.label, text: p.text },
    };
  });

  return {
    size: { width: W, height: H },
    selected: true,
    name: "LuckyTracky Main Menu",
    chatBarText: "📋 Menu",
    areas,
  };
}

export async function POST() {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "LINE_CHANNEL_ACCESS_TOKEN not set" }, { status: 500 });
  }

  try {
    // 1. Delete existing rich menus
    const listRes = await fetch(RICH_MENU_API, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const listData = await listRes.json() as { richmenus?: Array<{ richMenuId: string }> };
    for (const rm of listData.richmenus ?? []) {
      await fetch(`${RICH_MENU_API}/${rm.richMenuId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    // 2. Create new rich menu
    const menu = buildRichMenu();
    const createRes = await fetch(RICH_MENU_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(menu),
    });

    const created = await createRes.json() as { richMenuId?: string; message?: string };

    if (!createRes.ok || !created.richMenuId) {
      return NextResponse.json({ error: "Failed to create rich menu", detail: created }, { status: 500 });
    }

    // 3. Set as default rich menu
    await fetch(`https://api.line.me/v2/bot/user/all/richmenu/${created.richMenuId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json({
      ok: true,
      richMenuId: created.richMenuId,
      message: "Rich menu created and set as default. Upload an image next.",
      nextStep: `curl -X POST https://api-data.line.me/v2/bot/richmenu/${created.richMenuId}/content -H "Authorization: Bearer {token}" -H "Content-Type: image/png" --data-binary @menu.png`,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
