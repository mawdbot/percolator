import { NextRequest, NextResponse } from "next/server";
import { searchTokens } from "@/lib/birdeye";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  try {
    const data = await searchTokens(q);
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    console.error("Token search error:", e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
