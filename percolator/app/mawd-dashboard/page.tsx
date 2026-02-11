"use client";

import { useEffect, useState } from "react";
// Stub: jupiverse-kit not installed. Install it + @jup-ag/wallet-adapter for real swap terminal.
const IntegratedTerminal = ({ formProps, containerStyles }: any) => (
  <div style={{ ...containerStyles, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "0.8rem", border: "1px dashed rgba(100,116,139,0.3)", borderRadius: "12px", minHeight: "300px" }}>
    Jupiter Terminal — install <code style={{ margin: "0 4px", color: "#22d3ee" }}>jupiverse-kit</code> to enable
  </div>
);
import { toast } from "sonner";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { TokenSearch } from "@/components/TokenSearch";
import { MawdMiniChart } from "@/components/MawdMiniChart";
import { useBirdeyeTokenStats } from "@/hooks/useBirdeyeTokenStats";
import { useBirdeyeTokenTxs } from "@/hooks/useBirdeyeTokenTxs";
import { useBirdeyeMultiTokenStats } from "@/hooks/useBirdeyeMultiTokenStats";
import type { OhlcvPoint, TokenListItem } from "@/lib/birdeye";

const MAWD_ADDRESS = "5Bphs5Q6nbq1FRQ7sk3MUYNE8JHzoSKVyeZWYM94pump";

type PriceData = {
  value: number;
  valueChange24h: number;
};

type YoloTrade = {
  tx_type: string;
  tx_hash: string;
  block_unix_time: number;
  volume_usd: number;
  volume: number;
  owner: string;
  source: string;
};

function formatNumber(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(2) + "K";
  return n.toFixed(2);
}

export default function MawdDashboard() {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [priceError, setPriceError] = useState<string | null>(null);

  const [ohlcv, setOhlcv] = useState<OhlcvPoint[]>([]);
  const [ohlcvError, setOhlcvError] = useState<string | null>(null);

  const [watchlist, setWatchlist] = useState<TokenListItem[]>([]);

  const { stats: liveStats, connected: statsWsConnected } =
    useBirdeyeTokenStats(MAWD_ADDRESS);
  const { trades, connected: txsWsConnected, error: txsError } =
    useBirdeyeTokenTxs(MAWD_ADDRESS);

  const watchlistAddresses = watchlist.map((t) => t.address);
  const {
    statsMap: watchStats,
    connected: watchStatsWsConnected,
  } = useBirdeyeMultiTokenStats(watchlistAddresses);

  const [yoloTrades, setYoloTrades] = useState<YoloTrade[]>([]);
  const [yoloError, setYoloError] = useState<string | null>(null);

  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? localStorage.getItem("mawd_watchlist")
        : null;
    if (raw) {
      try {
        setWatchlist(JSON.parse(raw));
      } catch { }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("mawd_watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = (token: TokenListItem) => {
    setWatchlist((prev) =>
      prev.some((t) => t.address === token.address) ? prev : [...prev, token],
    );
  };
  const removeFromWatchlist = (address: string) => {
    setWatchlist((prev) => prev.filter((t) => t.address !== address));
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const fetchData = async () => {
      try {
        const [priceRes, ohlcvRes] = await Promise.all([
          fetch("/api/mawd/price", { cache: "no-store" }).catch(() => null),
          fetch("/api/mawd/ohlcv", { cache: "no-store" }),
        ]);

        if (priceRes) {
          const pJson = await priceRes.json();
          if (!pJson.ok) throw new Error(pJson.error || "Price fetch failed");
          setPriceData(pJson.data);
        }

        const oJson = await ohlcvRes.json();
        if (!oJson.ok) throw new Error(oJson.error || "OHLCV fetch failed");
        setOhlcv(oJson.data);
        setOhlcvError(null);
      } catch (e: any) {
        console.error(e);
        setPriceError(e.message);
      } finally {
        setLoadingPrice(false);
      }
    };

    fetchData();
    timer = setInterval(fetchData, 30_000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchYolo = async () => {
      try {
        const res = await fetch("/api/mawd/yolo", { cache: "no-store" });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || "YOLO fetch failed");
        setYoloTrades(json.data);
        setYoloError(null);
      } catch (e: any) {
        console.error(e);
        setYoloError(e.message);
      }
    };

    fetchYolo();
    const id = setInterval(fetchYolo, 60_000);

    return () => clearInterval(id);
  }, []);

  const price = liveStats?.price ?? priceData?.value ?? 0;
  const change24h =
    liveStats?.price_change_24h_percent ?? priceData?.valueChange24h ?? 0;
  const positive = change24h >= 0;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex justify-center items-center p-4">
      <div className="w-full max-w-6xl bg-slate-900/80 rounded-2xl border border-slate-700 p-6 shadow-xl space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">$MAWD Dashboard</h1>
            <p className="text-xs text-slate-400">
              Son of Anton • Token: {" "}
              <code className="break-all">{MAWD_ADDRESS}</code>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/40">
              Stats: {statsWsConnected ? "Realtime WS" : "Loading"}
            </span>
            <span className="px-3 py-1 rounded-full text-xs bg-sky-500/10 text-sky-400 border border-sky-500/40">
              Trades: {txsWsConnected ? "Realtime WS" : "Loading"}
            </span>
            <WalletConnectButton />
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2 bg-slate-950/50 rounded-xl p-4 border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">$MAWD Price</span>
              {loadingPrice && (
                <span className="text-xs text-slate-500">Updating…</span>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold">
                {price ? `$${price.toFixed(8)}` : "--"}
              </span>
              <span
                className={`text-sm ${positive ? "text-emerald-400" : "text-rose-400"
                  }`}
              >
                {price
                  ? `${positive ? "+" : ""}${change24h.toFixed(2)}% 24h`
                  : ""}
              </span>
            </div>

            {priceError && (
              <p className="mt-2 text-xs text-rose-400">Error: {priceError}</p>
            )}
          </div>

          <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Son of Anton Mode</div>
            <div className="text-sm">
              {positive
                ? "Anton’s heir is feasting. Momentum is green."
                : "Dark tides. The Son of Anton waits for better entries."}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-slate-400">$MAWD Stats & Chart</span>
              {liveStats && (
                <span className="text-[10px] text-slate-500">
                  24h Vol: {" "}
                  {liveStats.volume_24h_usd
                    ? `$${formatNumber(liveStats.volume_24h_usd)}`
                    : "--"}
                </span>
              )}
            </div>

            {liveStats && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px] mb-3">
                <div>
                  <div className="text-slate-500">Price</div>
                  <div className="text-slate-100">
                    ${liveStats.price.toFixed(8)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Market Cap</div>
                  <div className="text-slate-100">
                    {liveStats.marketcap
                      ? `$${formatNumber(liveStats.marketcap)}`
                      : "--"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">FDV</div>
                  <div className="text-slate-100">
                    {liveStats.fdv
                      ? `$${formatNumber(liveStats.fdv)}`
                      : "--"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Liquidity</div>
                  <div className="text-slate-100">
                    {liveStats.liquidity
                      ? `$${formatNumber(liveStats.liquidity)}`
                      : "--"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">1h Δ</div>
                  <div
                    className={
                      (liveStats.price_change_1h_percent ?? 0) >= 0
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }
                  >
                    {liveStats.price_change_1h_percent != null
                      ? `${liveStats.price_change_1h_percent.toFixed(2)}%`
                      : "--"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">24h Δ</div>
                  <div
                    className={
                      (liveStats.price_change_24h_percent ?? 0) >= 0
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }
                  >
                    {liveStats.price_change_24h_percent != null
                      ? `${liveStats.price_change_24h_percent.toFixed(2)}%`
                      : "--"}
                  </div>
                </div>
              </div>
            )}

            {ohlcvError && (
              <p className="text-[11px] text-rose-400 mb-2">
                Chart error: {ohlcvError}
              </p>
            )}

            <MawdMiniChart data={ohlcv} />
            <p className="mt-1 text-[10px] text-slate-500">
              Last 4h • 1m candles • Birdeye
            </p>
          </div>

          <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">Quick Links</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <a
                href="https://birdeye.so/solana/token/5Bphs5Q6nbq1FRQ7sk3MUYNE8JHzoSKVyeZWYM94pump"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded-full border border-slate-700 hover:border-emerald-500 hover:text-emerald-300 transition"
              >
                Birdeye
              </a>
              <a
                href="https://solscan.io/account/2GXRGbnA21FFJY3bhMypMf1JYvF1Yuhzov2DQo5aXnJa"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded-full border border-slate-700 hover:border-emerald-500 hover:text-emerald-300 transition"
              >
                Solscan (Pool)
              </a>
              <a
                href="https://jup.ag/?buy=5Bphs5Q6nbq1FRQ7sk3MUYNE8JHzoSKVyeZWYM94pump"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded-full border border-slate-700 hover:border-emerald-500 hover:text-emerald-300 transition"
              >
                Jupiter (Swap)
              </a>
              <a
                href="https://raydium.io/swap/?inputMint=sol&outputMint=5Bphs5Q6nbq1FRQ7sk3MUYNE8JHzoSKVyeZWYM94pump"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded-full border border-slate-700 hover:border-emerald-500 hover:text-emerald-300 transition"
              >
                Raydium (Swap)
              </a>
            </div>
          </div>
        </section>

        <section className="bg-slate-950/60 rounded-2xl border border-slate-800 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold">Swap $MAWD</h2>
              <p className="text-xs text-slate-400">
                Jupiter-powered terminal. Verify the mint before confirming:
                <br />
                <code className="text-[10px] break-all">{MAWD_ADDRESS}</code>
              </p>
            </div>
          </div>

          <div className="w-full flex justify-center">
            <IntegratedTerminal
              rpcUrl={process.env.NEXT_PUBLIC_RPC_URL}
              onSuccess={({ txid }: { txid: string }) => {
                toast.success("Swap successful: " + txid);
              }}
              onSwapError={() => {
                toast.error("Error: An unknown error occurred");
              }}
              containerStyles={{
                zIndex: 100,
                width: "100%",
                maxWidth: "420px",
                height: "568px",
                display: "flex",
              }}
            />
          </div>

          <p className="mt-3 text-[11px] text-slate-500">
            The Son of Anton reminder: double-check the token address, watch
            slippage, and don’t over-size into thin liquidity.
          </p>
        </section>

        <section className="bg-slate-950/60 rounded-2xl border border-slate-800 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold">Token Watchlist</h2>
              <p className="text-[10px] text-slate-500">
                {watchStatsWsConnected
                  ? "Realtime stats via Birdeye"
                  : "Connecting…"}
              </p>
            </div>
            <TokenSearch onSelect={addToWatchlist} />
          </div>

          {!watchlist.length ? (
            <p className="text-xs text-slate-500">
              Search for tokens and add them to your MAWD watchlist.
            </p>
          ) : (
            <div className="space-y-1 text-xs">
              {watchlist.map((t) => {
                const s = watchStats[t.address];
                const change = s?.price_change_24h_percent ?? 0;
                const up = change >= 0;

                return (
                  <div
                    key={t.address}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950 border border-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      {t.logo_uri && (
                        <img
                          src={t.logo_uri}
                          alt={t.symbol}
                          className="w-4 h-4 rounded-full"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{t.symbol}</span>
                          <span className="text-slate-400">{t.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {t.address.slice(0, 6)}…{t.address.slice(-4)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right text-[10px]">
                        <div className="text-slate-300">
                          {s?.price != null
                            ? `$${s.price.toFixed(8)}`
                            : "--"}
                        </div>
                        <div
                          className={
                            up ? "text-emerald-400" : "text-rose-400"
                          }
                        >
                          {s?.price_change_24h_percent != null
                            ? `${s.price_change_24h_percent.toFixed(2)}%`
                            : "--"}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromWatchlist(t.address)}
                        className="text-[10px] text-slate-500 hover:text-rose-400"
                      >
                        remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="bg-slate-950/60 rounded-2xl border border-slate-800 p-4 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">
              YOLO Mode: Largest MAWD Buys
            </h2>
            <span className="text-[10px] text-slate-500">
              Top recent buys by USD volume
            </span>
          </div>

          {yoloError && (
            <p className="text-xs text-rose-400 mb-2">Error: {yoloError}</p>
          )}

          {!yoloTrades.length ? (
            <p className="text-xs text-slate-500">No big buys detected yet…</p>
          ) : (
            <div className="max-h-64 overflow-y-auto text-xs space-y-2">
              {yoloTrades.map((tx) => {
                const ts = new Date(tx.block_unix_time * 1000);
                return (
                  <div
                    key={tx.tx_hash}
                    className="flex items-start justify-between gap-3 border-b border-slate-800 pb-1 last:border-b-0"
                  >
                    <div>
                      <div className="font-medium text-emerald-400">
                        YOLO Buy • ${tx.volume_usd.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Amount: {tx.volume.toFixed(4)} MAWD
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {tx.owner.slice(0, 4)}…{tx.owner.slice(-4)} • {" "}
                        {ts.toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 text-right">
                      {tx.source}
                      <br />
                      <a
                        href={`https://solscan.io/tx/${tx.tx_hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-400 hover:underline"
                      >
                        View tx
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="mt-2 text-[10px] text-slate-500">
            YOLO Mode is for sharks only. Big green candles don’t guarantee exit
            liquidity—Anton taught his son that the hard way.
          </p>
        </section>

        <section className="bg-slate-950/60 rounded-2xl border border-slate-800 p-4 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Son of Anton Trade Feed</h2>
            <span className="text-[10px] text-slate-500">
              Live swaps • Birdeye TXS websocket
            </span>
          </div>

          {txsError && (
            <p className="text-xs text-rose-400 mb-2">Error: {txsError}</p>
          )}

          {!trades.length ? (
            <p className="text-xs text-slate-500">Waiting for trades…</p>
          ) : (
            <div className="max-h-72 overflow-y-auto text-xs space-y-2">
              {trades.map((tx) => {
                const side =
                  tx.side === "buy" || tx.side === "sell" ? tx.side : "swap";
                const ts = new Date(tx.blockUnixTime * 1000);
                const label =
                  side === "buy" ? "Buy" : side === "sell" ? "Sell" : "Swap";

                const color =
                  side === "buy"
                    ? "text-emerald-400"
                    : side === "sell"
                      ? "text-rose-400"
                      : "text-slate-300";

                return (
                  <div
                    key={tx.txHash}
                    className="flex items-start justify-between gap-3 border-b border-slate-800 pb-1 last:border-b-0"
                  >
                    <div>
                      <div className={`font-medium ${color}`}>{label}</div>
                      <div className="text-[10px] text-slate-500">
                        {tx.base?.symbol} → {tx.quote?.symbol} • {" "}
                        {tx.volumeUSD ? `$${tx.volumeUSD.toFixed(2)}` : ""}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {tx.owner.slice(0, 4)}…{tx.owner.slice(-4)} • {" "}
                        {ts.toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {tx.source}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="mt-2 text-[10px] text-slate-500">
            The Son of Anton watches flows. Big buys? Maybe follow. Big sells?
            Maybe front‑run the jeets.
          </p>
        </section>
      </div>
    </main>
  );
}
