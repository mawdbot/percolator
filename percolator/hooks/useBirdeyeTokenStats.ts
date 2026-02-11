"use client";

import { useEffect, useRef, useState } from "react";

export type TokenStats = {
  address: string;
  price: number;
  marketcap?: number;
  fdv?: number;
  liquidity?: number;
  volume_24h_usd?: number;
  price_change_24h_percent?: number;
  price_change_1h_percent?: number;
};

type WsMessage =
  | { type: "TOKEN_STATS_DATA"; data: any }
  | { type: string; data?: any };

export function useBirdeyeTokenStats(address: string) {
  const [stats, setStats] = useState<TokenStats | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!address) return;

    const apiKey = process.env.NEXT_PUBLIC_BIRDEYE_WS_KEY;
    if (!apiKey) {
      setError("Missing NEXT_PUBLIC_BIRDEYE_WS_KEY");
      return;
    }

    const url = `wss://public-api.birdeye.so/socket/solana?x-api-key=${apiKey}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);

      const msg = {
        type: "SUBSCRIBE_TOKEN_STATS",
        data: {
          address,
          select: {
            price: true,
            trade_data: {
              volume: true,
              price_change: true,
              intervals: ["1h", "24h"],
            },
            fdv: true,
            marketcap: true,
            liquidity: true,
          },
        },
      };

      ws.send(JSON.stringify(msg));
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as WsMessage;
        if (payload.type === "TOKEN_STATS_DATA") {
          const d = payload.data;
          setStats({
            address: d.address,
            price: d.price,
            marketcap: d.marketcap,
            fdv: d.fdv,
            liquidity: d.liquidity,
            volume_24h_usd: d.volume_24h_usd,
            price_change_24h_percent: d.price_change_24h_percent,
            price_change_1h_percent: d.price_change_1h_percent,
          });
        }
      } catch (e: any) {
        console.error("TOKEN_STATS WS parse error:", e);
        setError(e.message);
      }
    };

    ws.onerror = (e) => {
      console.error("TOKEN_STATS WS error:", e);
      setError("WebSocket error");
    };

    ws.onclose = () => {
      setConnected(false);
    };

    return () => {
      try {
        ws.send(
          JSON.stringify({
            type: "UNSUBSCRIBE_TOKEN_STATS",
            data: { address },
          }),
        );
      } catch {}
      ws.close();
    };
  }, [address]);

  return { stats, connected, error };
}
