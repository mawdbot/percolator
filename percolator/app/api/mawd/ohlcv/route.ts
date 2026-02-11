import { NextResponse } from "next/server";
import { getMawdOhlcv } from "@/lib/birdeye";

export async function GET() {
  try {
    const data = await getMawdOhlcv();
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    console.error("MAWD ohlcv error:", e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
