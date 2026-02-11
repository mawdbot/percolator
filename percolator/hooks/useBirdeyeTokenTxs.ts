"use client";

import { useEffect, useRef, useState } from "react";

export type MawdTrade = {
  txHash: string;
  blockUnixTime: number;
  owner: string;
  source: string;
  volumeUSD: number;
  side?: string;
  base?: { symbol: string; uiAmount: number };
  quote?: { symbol: string; uiAmount: number };
};

type TxWsMessage =
  | { type: "TXS_DATA"; data: any }
  | { type: string; data?: any };

export function useBirdeyeTokenTxs(address: string) {
  const [trades, setTrades] = useState<MawdTrade[]>([]);
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
        type: "SUBSCRIBE_TXS",
        data: {
          queryType: "simple",
          address,
          txsType: "swap",
        },
      };

      ws.send(JSON.stringify(msg));
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as TxWsMessage;
        if (payload.type === "TXS_DATA") {
          const d = payload.data;

          const trade: MawdTrade = {
            txHash: d.txHash,
            blockUnixTime: d.blockUnixTime,
            owner: d.owner,
            source: d.source,
            volumeUSD: d.volumeUSD,
            side: d.side,
            base: d.base
              ? {
                  symbol: d.base.symbol,
                  uiAmount: d.base.uiAmount,
                }
              : undefined,
            quote: d.quote
              ? {
                  symbol: d.quote.symbol,
                  uiAmount: d.quote.uiAmount,
                }
              : undefined,
          };

          setTrades((prev) => {
            const next = [trade, ...prev];
            return next.slice(0, 100);
          });
        }
      } catch (e: any) {
        console.error("TXS WS parse error:", e);
        setError(e.message);
      }
    };

    ws.onerror = (e) => {
      console.error("TXS WS error:", e);
      setError("WebSocket error");
    };

    ws.onclose = () => {
      setConnected(false);
    };

    return () => {
      try {
        ws.send(
          JSON.stringify({
            type: "UNSUBSCRIBE_TXS",
            data: { address },
          }),
        );
      } catch {}
      ws.close();
    };
  }, [address]);

  return { trades, connected, error };
}
