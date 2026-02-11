import { NextResponse } from "next/server";

const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY!;
const BIRDEYE_BASE = "https://public-api.birdeye.so";
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS!;

export async function GET() {
  if (!BIRDEYE_API_KEY || !TOKEN_ADDRESS) {
    return NextResponse.json(
      { ok: false, error: "Missing BIRDEYE_API_KEY or TOKEN_ADDRESS" },
      { status: 500 },
    );
  }

  try {
    const params = new URLSearchParams({
      token_address: TOKEN_ADDRESS,
      volume_type: "usd",
      sort_by: "block_unix_time",
      sort_type: "desc",
      tx_type: "buy",
      ui_amount_mode: "scaled",
      offset: "0",
      limit: "50",
    });

    const res = await fetch(
      `${BIRDEYE_BASE}/defi/v3/token/txs-by-volume?${params}`,
      {
        headers: {
          "X-API-KEY": BIRDEYE_API_KEY,
          accept: "application/json",
          "x-chain": "solana",
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      throw new Error(`Birdeye txs-by-volume ${res.status}`);
    }

    const json = await res.json();
    return NextResponse.json({ ok: true, data: json.data.items });
  } catch (e: any) {
    console.error("MAWD YOLO error:", e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
