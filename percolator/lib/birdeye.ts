// lib/birdeye.ts
const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY!;
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS!;
const BIRDEYE_BASE = "https://public-api.birdeye.so";

if (!BIRDEYE_API_KEY) throw new Error("Missing BIRDEYE_API_KEY");
if (!TOKEN_ADDRESS) throw new Error("Missing TOKEN_ADDRESS");

async function beFetch<T>(path: string, params: URLSearchParams) {
  const url = `${BIRDEYE_BASE}${path}?${params.toString()}`;
  const res = await fetch(url, {
    headers: {
      "X-API-KEY": BIRDEYE_API_KEY,
      accept: "application/json",
      "x-chain": "solana",
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Birdeye ${path} ${res.status}`);
  const json = await res.json();
  return json.data as T;
}

export type OhlcvPoint = {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
};

export async function getMawdOhlcv(): Promise<OhlcvPoint[]> {
  const now = Math.floor(Date.now() / 1000);
  const fourHoursAgo = now - 4 * 60 * 60;

  const params = new URLSearchParams({
    address: TOKEN_ADDRESS,
    type: "1m",
    currency: "usd",
    ui_amount_mode: "raw",
    time_from: fourHoursAgo.toString(),
    time_to: now.toString(),
    mode: "range",
    padding: "false",
    outlier: "true",
  });

  type OhlcvResponse = {
    is_scaled_ui_token: boolean;
    items: {
      o: number;
      h: number;
      l: number;
      c: number;
      v: number;
      unix_time: number;
    }[];
  };

  const data = await beFetch<OhlcvResponse>("/defi/v3/ohlcv", params);
  return data.items.map((item) => ({
    t: item.unix_time,
    o: item.o,
    h: item.h,
    l: item.l,
    c: item.c,
    v: item.v,
  }));
}

/** Token-list item for search/watchlist */
export type TokenListItem = {
  address: string;
  name: string;
  symbol: string;
  decimals?: number;
  logo_uri?: string;
  liquidity?: number;
  market_cap?: number;
  fdv?: number;
  price?: number;
};

export async function searchTokens(q: string): Promise<TokenListItem[]> {
  if (!q || q.length < 2) return [];

  const params = new URLSearchParams({
    sort_by: "liquidity",
    sort_type: "desc",
    offset: "0",
    limit: "100",
    ui_amount_mode: "scaled",
  });

  const data: any = await beFetch("/defi/v3/token/list", params);
  const items: any[] = data.items ?? [];

  const lower = q.toLowerCase();

  return items
    .filter((t) => {
      const name = (t.name || "").toLowerCase();
      const symbol = (t.symbol || "").toLowerCase();
      const address = (t.address || "").toLowerCase();
      return (
        name.includes(lower) ||
        symbol.includes(lower) ||
        address.startsWith(lower)
      );
    })
    .slice(0, 20)
    .map((t) => ({
      address: t.address,
      name: t.name,
      symbol: t.symbol,
      decimals: t.decimals,
      logo_uri: t.logo_uri,
      liquidity: t.liquidity,
      market_cap: t.market_cap,
      fdv: t.fdv,
      price: t.price,
    }));
}
