# ☕ Percolator — Risk Engine Dashboard

> **Formally verified accounting & risk engine for perpetual futures DEXs on Solana.**
>
> ⚠️ **EDUCATIONAL RESEARCH PROJECT** — Not production ready. Do NOT use with real funds.

---

## What Is This?

Percolator is a two-layer project:

1. **Engine** (Rust, `no_std`, `#[forbid(unsafe_code)]`) — A formally verified risk engine that manages accounts, capital, PnL, funding, liquidations, and an insurance fund for perpetual futures. Verified with [Kani](https://model-checking.github.io/kani/).

2. **Dashboard** (Next.js 15 / React 19 / TypeScript) — A premium dark-themed dashboard that visualizes the engine's state in real time, connected to **Solana mainnet via Helius RPC** for live cluster data.

The dashboard runs a **simulation** of the Rust engine logic in TypeScript, generating realistic account data that ticks every 5 seconds to demonstrate crank/market dynamics. Live Solana cluster data (slot, epoch, TPS, supply) is fetched from Helius every 15 seconds.

---

## Architecture

```
percolator/
├── risk_engine.rs         # Core Rust engine (~3400 lines, no_std)
├── i128.rs                # BPF-safe 128-bit types (Kani + SBF)
├── risk_engine_i128.rs    # Minimal stub for standalone compilation
├── Cargo.toml             # Rust workspace (engine crate)
├── src/
│   └── percolator.rs      # Original engine (reference)
│
└── percolator/            # Next.js dashboard
    ├── app/
    │   ├── layout.tsx              # Root layout (metadata, globals.css)
    │   ├── page.tsx                # Main dashboard (risk engine viz)
    │   ├── mawd-dashboard/
    │   │   └── page.tsx            # MAWD trading terminal
    │   ├── api/
    │   │   ├── solana/cluster/
    │   │   │   └── route.ts        # Live Solana cluster info via Helius
    │   │   ├── mawd/               # Birdeye token data APIs
    │   │   └── tokens/             # Token search API
    │   └── providers/
    │       └── wallet-provider.tsx  # Wallet adapter (stub, install jupiverse-kit)
    │
    ├── components/
    │   ├── StatCard.tsx             # Animated metric card with color coding
    │   ├── GaugeRing.tsx            # SVG ring gauge for ratio metrics
    │   ├── BalanceSheet.tsx         # Vault breakdown with stacked bar chart
    │   ├── CrankStatus.tsx          # Keeper crank monitoring panel
    │   ├── ClusterInfo.tsx          # Live Solana cluster data
    │   ├── AccountsTable.tsx        # Sortable accounts slab viewer
    │   ├── WalletConnectButton.tsx  # Wallet button (stub)
    │   ├── TokenSearch.tsx          # Token search component
    │   └── MawdMiniChart.tsx        # OHLCV mini chart
    │
    ├── hooks/
    │   ├── useRiskEngineSimulation.ts  # Engine simulation (generates accounts, ticks)
    │   ├── useBirdeyeTokenStats.ts     # Birdeye token price/stats
    │   ├── useBirdeyeTokenTxs.ts       # Birdeye transaction feed
    │   └── useBirdeyeMultiTokenStats.ts # Multi-token watchlist
    │
    ├── lib/
    │   ├── risk-engine.ts           # TypeScript types (1:1 Rust struct mapping)
    │   ├── solana.ts                # Solana Connection singleton (Helius RPC)
    │   └── birdeye.ts               # Birdeye API client
    │
    ├── globals.css                  # Premium dark theme (glassmorphism, animations)
    ├── package.json                 # Dependencies
    ├── next.config.ts               # Next.js config (env exposure)
    ├── tsconfig.json                # TypeScript config
    ├── .env.example                 # Environment template
    └── .gitignore                   # Build artifacts, .env, node_modules
```

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **Helius RPC API key** (free tier works: [helius.dev](https://www.helius.dev/))

### Setup

```bash
# 1. Navigate to the dashboard directory
cd percolator/percolator

# 2. Copy environment template and add your keys
cp .env.example .env
# Edit .env with your Helius API key:
#   RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
#   HELIUS_API_KEY=YOUR_KEY

# 3. Install dependencies
npm install

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the dashboard should load with:
- ☕ Hero header with status badges
- Simulated risk engine metrics (auto-starts after 800ms)
- Live Solana cluster data (polls every 15s)

### Build for Production

```bash
npm run build
npm start
```

---

## Dashboard Pages

### `/` — Risk Engine Dashboard (Main)

The primary dashboard with three tabs:

#### Overview Tab
- **Stat Grid** — Vault Balance, Insurance Fund, Open Interest, Active Accounts
- **Solana Cluster** — Live slot, block height, epoch, TPS, supply, epoch progress gauge (via Helius RPC)
- **Balance Sheet** — Stacked bar visualization of Capital (C_tot), Insurance, and Residual; haircut ratio, fee revenue, PNL_pos_tot
- **Keeper Crank** — Crank freshness gauge, funding rate, sweep status, lifetime liquidations/force-realize stats, risk reduction mode indicator
- **Risk Parameters** — Full parameter grid showing all engine constants (margins, fees, budgets, limits)

#### Accounts Tab
- **Sortable Table** — All simulated accounts with index, type (User/LP badges), owner address, capital, PnL (color-coded), position size/direction, entry price, warmup status
- Click column headers to sort ascending/descending

#### Engine Spec Tab
- **Security Claim** — The core guarantee quoted from the spec
- **Invariants** — I1–I5 formally verified properties
- **Architecture** — Variation margin, pluggable matching, oracle-price liquidation, cursor-based crank, PnL warmup, ADL waterfall
- **Formal Verification** — Kani commands and setup

### `/mawd-dashboard` — MAWD Trading Terminal

The existing MAWD cockpit with:
- Live token price display (via Birdeye API)
- OHLCV chart
- Jupiter swap terminal (requires `jupiverse-kit` installation)
- Token watchlist
- Live trade feed

> **Note**: The swap terminal requires `npm install jupiverse-kit @jup-ag/wallet-adapter` — the dashboard works without it but shows a placeholder.

---

## TypeScript ↔ Rust Type Mapping

The `lib/risk-engine.ts` file contains a **1:1 mapping** of every Rust struct in `risk_engine.rs`. Here's how they correspond:

| Rust Struct | TypeScript Interface | Lines in Rust |
|---|---|---|
| `Account` | `PercolatorAccount` | 99–173 |
| `AccountKind` | `AccountKind` | 83–86 |
| `InsuranceFund` | `InsuranceFund` | 211–217 |
| `RiskParams` | `RiskParams` | 241–298 |
| `RiskEngine` | `EngineState` | 303–429 |
| `ClosedOutcome` | `ClosedOutcome` | 221–236 |
| `TradeExecution` | `TradeExecution` | 584–590 |
| `RiskError` | `RiskError` | 436–466 |
| `CrankOutcome` | `CrankOutcome` | 472–508 |

The Rust engine uses `I128`/`U128` newtypes from `i128.rs` which wrap:
- **Kani builds**: `#[repr(transparent)]` over native `i128`/`u128`
- **BPF/SBF builds**: `#[repr(C)] [u64; 2]` for stable 8-byte alignment

In TypeScript, these map to `number` (for values within f64 precision) or `bigint` (for `MAX_POSITION_ABS`).

---

## Engine Simulation

Since the Rust engine is a library (not a deployed Solana program), the dashboard runs a **TypeScript simulation** that:

1. **Generates** 24 accounts (15% LP, 85% User) with realistic capital, positions, and PnL
2. **Computes** derived metrics matching the engine's logic:
   - `haircut_ratio = min(Residual, PNL_pos_tot) / PNL_pos_tot` (spec §3.2)
   - `residual = max(0, V - C_tot - I)`
   - Insurance fund health and risk reduction mode
3. **Ticks** every 5 seconds — PnL drifts simulate market movements, slots advance

The simulation hook is in `hooks/useRiskEngineSimulation.ts`.

---

## Live Solana Data

The `/api/solana/cluster` route fetches real-time data from Solana mainnet via your Helius RPC:

| Metric | Source |
|---|---|
| Slot | `getSlot()` |
| Block Height | `getBlockHeight()` |
| Epoch / Progress | `getEpochInfo()` |
| TPS | `getRecentPerformanceSamples(1)` |
| Total / Circulating Supply | `getSupply()` |
| Solana Version | `getVersion()` |

The `ClusterInfo` component polls this every 15 seconds and renders:
- Metric grid with slot, block height, epoch, TPS, supply
- SVG gauge ring showing epoch progress percentage

---

## Premium Dark Theme

The visual design in `globals.css` features:

- **Color system**: HSL-based palette with accent colors (blue, emerald, violet, amber, rose, cyan)
- **Glassmorphism**: `backdrop-filter: blur(16px)` on all cards
- **Gradients**: Radial background gradient, linear card fills
- **Animations**: `fade-in-up` entrance, `pulseSlow` breathing, `shimmer` loading
- **Components**: Cards, tables, badges (LP/User), stat pills, gauge rings, progress bars, warning banners
- **Typography**: Monospace for values (`--font-mono`), clean hierarchy for labels

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `RPC_URL` | ✅ | Solana RPC endpoint (Helius recommended) |
| `HELIUS_API_KEY` | ✅ | Helius API key |
| `NEXT_PUBLIC_RPC_URL` | ✅ | Client-visible RPC URL |
| `BIRDEYE_API_KEY` | Optional | Birdeye API key (for MAWD dashboard) |
| `TOKEN_ADDRESS` | Optional | Default token to track |
| `WALLET_CONNECT_PROJECT_ID` | Optional | WalletConnect project ID |

---

## Rust Engine — Key Concepts

### Core Invariants (Formally Verified with Kani)

- **I1**: User capital is NEVER reduced by ADL/socialization
- **I2**: PNL warmup prevents instant withdrawal of manipulated profits
- **I3**: ADL haircuts apply to unwarmed PNL first, protecting principal
- **I4**: Conservation of funds across all operations
- **I5**: User isolation — one user's actions don't affect others' capital

### Architecture Highlights

| Component | Description |
|---|---|
| **Variation Margin** | Positions settled to oracle mark before mutation |
| **Pluggable Matching** | `MatchingEngine` trait — LP-provided AMM/RFQ/CLOB |
| **Oracle-Price Liquidation** | Close at oracle price, no counterparty LP needed |
| **Cursor-Based Crank** | Bounded scan with `ACCOUNTS_PER_CRANK` budget |
| **PnL Warmup** | Profits vest linearly over `warmup_period_slots` |
| **ADL Waterfall** | Auto-deleverage with haircut ratio h |
| **Insurance Fund** | Buffer for socialized losses; risk-reduction mode when depleted |

### Running Kani Verification

```bash
# From the project root (where Cargo.toml is)
cargo install --locked kani-verifier
cargo kani setup
cargo kani
```

---

## Development

### Adding New Components

Components follow the pattern in `components/StatCard.tsx`:
- `'use client'` directive (all interactive)
- Import types from `@/lib/risk-engine`
- Use CSS custom properties from `globals.css` (e.g., `var(--accent-blue)`)
- Inline styles for component-specific layout

### Extending the Simulation

Edit `hooks/useRiskEngineSimulation.ts`:
- `generateAccounts()` — Adjust account distribution, capital ranges
- `computeMetrics()` — Add new derived metrics
- Tick interval (currently 5000ms) — Adjust for faster/slower updates

### Adding Real On-Chain Data

When the Rust engine is deployed as a Solana program:
1. Add an API route in `app/api/percolator/state/route.ts` that reads the `RiskEngine` account
2. Deserialize using the layout from `risk-engine.ts` types
3. Replace the simulation hook with a real data fetcher

---

## Roadmap to Mainnet

> See the [parent README](../README.md) for the full Rust engine documentation.

1. **MVP Scope**: 1 collateral (USDC), 1 perp market (SOL-PERP), 1 matcher (NoOpMatcher for risk oracle mode)
2. **Solana Program**: Wrap `RiskEngine` in a real Solana program (`programs/risk-engine/`)
3. **Oracle Integration**: Pyth price feed adapter with confidence/staleness checks
4. **Client Integration**: Transaction builders for Deposit/Withdraw/Trade/Crank
5. **Testing**: Unit tests → Kani proofs → Localnet fuzzing → External audit
6. **Launch**: Mainnet with caps, kill-switch authority, monitoring dashboard

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Engine** | Rust (`no_std`, `#[forbid(unsafe_code)]`) |
| **Verification** | Kani model checker |
| **128-bit Types** | Custom `I128`/`U128` (BPF-safe `[u64; 2]`) |
| **Frontend** | Next.js 15, React 19, TypeScript 5.7 |
| **Styling** | Vanilla CSS (glassmorphism dark theme) |
| **RPC** | Helius (Solana mainnet) |
| **Token Data** | Birdeye API (optional) |
| **Swap** | Jupiter Terminal via jupiverse-kit (optional) |

---

## License

Apache-2.0 — Educational Research Only

---

*Built with ☕ by the Percolator team.*
