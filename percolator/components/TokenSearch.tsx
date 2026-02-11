"use client";

import { useEffect, useState } from "react";
import type { TokenListItem } from "@/lib/birdeye";

export function TokenSearch({
  onSelect,
}: {
  onSelect: (token: TokenListItem) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TokenListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const ctrl = new AbortController();
    const id = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/tokens/search?q=${encodeURIComponent(query)}`,
          { signal: ctrl.signal },
        );
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || "Search failed");
        setResults(json.data);
      } catch (e) {
        if (!ctrl.signal.aborted) console.error(e);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(id);
      ctrl.abort();
    };
  }, [query]);

  return (
    <div className="w-full max-w-md">
      <input
        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 outline-none focus:border-emerald-500"
        placeholder="Search tokens by name, symbol, or address"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading && (
        <div className="mt-1 text-[10px] text-slate-500">Searching…</div>
      )}
      {!!results.length && (
        <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950 text-xs">
          {results.map((t) => (
            <button
              key={t.address}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800/80 text-left"
              onClick={() => {
                onSelect(t);
                setQuery("");
                setResults([]);
              }}
            >
              {t.logo_uri && (
                <img
                  src={t.logo_uri}
                  alt={t.symbol}
                  className="w-4 h-4 rounded-full"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <span className="font-medium">{t.symbol}</span>
                  <span className="text-slate-400">{t.name}</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  {t.address.slice(0, 6)}…{t.address.slice(-4)}
                </div>
              </div>
              {typeof t.price === "number" && (
                <span className="text-[10px] text-slate-300">
                  ${t.price.toFixed(8)}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
