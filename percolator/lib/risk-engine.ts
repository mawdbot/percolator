// lib/risk-engine.ts — TypeScript types mirroring the Rust RiskEngine structs
// Source: risk_engine.rs + i128.rs (BPF-safe 128-bit wrappers)
//
// These types are a 1:1 mapping of the Rust structs in risk_engine.rs.
// The Rust engine uses I128/U128 newtypes (from i128.rs) which wrap native
// i128/u128 on Kani and [u64; 2] on BPF/SBF for alignment safety.
// In TypeScript we use `number` (for values that fit in f64) and `bigint`
// where precision matters.

// ============================================================================
// AccountKind — mirrors #[repr(u8)] enum AccountKind { User = 0, LP = 1 }
// ============================================================================
export type AccountKind = 'User' | 'LP';

// ============================================================================
// Account — mirrors pub struct Account (lines 99-173 of risk_engine.rs)
// ============================================================================
export interface PercolatorAccount {
    /** Unique account ID (monotonically increasing, never recycled) */
    index: number;
    /** account_id: u64 — Unique account ID from RiskEngine::next_account_id */
    accountId: number;
    /** kind: AccountKind — User = 0, LP = 1 */
    kind: AccountKind;

    // Capital & PNL
    /** capital: U128 — Deposited capital, NEVER reduced by ADL/socialization (Invariant I1) */
    capital: number;
    /** pnl: I128 — Realized PNL from trading (can be positive or negative) */
    pnl: number;
    /** reserved_pnl: u64 — PNL reserved for pending withdrawals */
    reservedPnl: number;

    // Warmup
    /** warmup_started_at_slot: u64 — Slot when warmup started */
    warmupStartedAtSlot: number;
    /** warmup_slope_per_step: U128 — Linear vesting rate per slot */
    warmupSlopePerStep: number;

    // Position
    /** position_size: I128 — Current position size (+ long, - short) */
    positionSize: number;
    /** entry_price: u64 — Last oracle mark price at settlement (NOT trade entry!) */
    entryPrice: number;

    // Funding
    /** funding_index: I128 — Funding index snapshot (quote per base, 1e6 scale) */
    fundingIndex: number;

    // LP-specific
    /** matcher_program: [u8; 32] — Matching engine program ID (zero for users) */
    matcherProgram?: string;
    /** matcher_context: [u8; 32] — Matching engine context account (zero for users) */
    matcherContext?: string;

    // Owner & Fees
    /** owner: [u8; 32] — Owner pubkey (signature checks done by wrapper) */
    owner: string;
    /** fee_credits: I128 — Fee credits in capital units (can go negative if owed) */
    feeCredits: number;
    /** last_fee_slot: u64 — Last slot when maintenance fees were settled */
    lastFeeSlot: number;
}

// ============================================================================
// InsuranceFund — mirrors pub struct InsuranceFund (lines 211-217)
// ============================================================================
export interface InsuranceFund {
    /** balance: U128 — Insurance fund balance */
    balance: number;
    /** fee_revenue: U128 — Accumulated fees from trades */
    feeRevenue: number;
}

// ============================================================================
// RiskParams — mirrors pub struct RiskParams (lines 241-298)
// ============================================================================
export interface RiskParams {
    /** warmup_period_slots: u64 — Warmup period in slots (time T) */
    warmupPeriodSlots: number;
    /** maintenance_margin_bps: u64 — e.g., 500 = 5% */
    maintenanceMarginBps: number;
    /** initial_margin_bps: u64 */
    initialMarginBps: number;
    /** trading_fee_bps: u64 */
    tradingFeeBps: number;
    /** max_accounts: u64 */
    maxAccounts: number;
    /** new_account_fee: U128 — Flat account creation fee */
    newAccountFee: number;
    /** risk_reduction_threshold: U128 — Insurance fund threshold for risk-reduction mode */
    riskReductionThreshold: number;
    /** maintenance_fee_per_slot: U128 — Slot-native maintenance fee per account */
    maintenanceFeePerSlot: number;
    /** max_crank_staleness_slots: u64 — Max staleness before crank required */
    maxCrankStalenessSlots: number;
    /** liquidation_fee_bps: u64 — e.g., 50 = 0.50% */
    liquidationFeeBps: number;
    /** liquidation_fee_cap: U128 — Absolute cap on liquidation fee */
    liquidationFeeCap: number;
    /** liquidation_buffer_bps: u64 — Buffer above maintenance margin after partial liq */
    liquidationBufferBps: number;
    /** min_liquidation_abs: U128 — Minimum position after partial liq (prevents dust) */
    minLiquidationAbs: number;
}

// ============================================================================
// ClosedOutcome — mirrors pub struct ClosedOutcome (lines 221-236)
// ============================================================================
export interface ClosedOutcome {
    /** abs_pos: u128 — Absolute position size that was closed */
    absPos: number;
    /** mark_pnl: i128 — Mark PnL from closing at oracle price */
    markPnl: number;
    /** cap_before: u128 — Capital before settlement */
    capBefore: number;
    /** cap_after: u128 — Capital after settlement */
    capAfter: number;
    /** position_was_closed: bool — Whether a position was actually closed */
    positionWasClosed: boolean;
}

// ============================================================================
// TradeExecution — mirrors pub struct TradeExecution (lines 584-590)
// ============================================================================
export interface TradeExecution {
    /** price: u64 — Actual execution price (may differ from oracle) */
    price: number;
    /** size: i128 — Actual executed size (may be partial fill) */
    size: number;
}

// ============================================================================
// RiskError — mirrors pub enum RiskError (lines 436-466)
// ============================================================================
export type RiskError =
    | 'InsufficientBalance'
    | 'Undercollateralized'
    | 'Unauthorized'
    | 'InvalidMatchingEngine'
    | 'PnlNotWarmedUp'
    | 'Overflow'
    | 'AccountNotFound'
    | 'NotAnLPAccount'
    | 'PositionSizeMismatch'
    | 'AccountKindMismatch';

// ============================================================================
// CrankOutcome — mirrors pub struct CrankOutcome (lines 472-508)
// ============================================================================
export interface CrankOutcome {
    /** Whether the crank successfully advanced last_crank_slot */
    advanced: boolean;
    /** Slots forgiven for caller's maintenance (50% discount via time forgiveness) */
    slotsForgiven: number;
    /** Whether caller's maintenance fee settle succeeded */
    callerSettleOk: boolean;
    /** Whether force-realize mode is active (insurance at/below threshold) */
    forceRealizeNeeded: boolean;
    /** Whether panic_settle_all should be called (system in stress) */
    panicNeeded: boolean;
    /** Number of accounts liquidated during this crank */
    numLiquidations: number;
    /** Number of liquidation errors (triggers risk_reduction_only) */
    numLiqErrors: number;
    /** Number of dust accounts garbage collected during this crank */
    numGcClosed: number;
    /** Number of positions force-closed during this crank */
    forceRealizeClosed: number;
    /** Number of force-realize errors during this crank */
    forceRealizeErrors: number;
    /** Index where this crank stopped (next crank continues from here) */
    lastCursor: number;
    /** Whether this crank completed a full sweep of all accounts */
    sweepComplete: boolean;
}

// ============================================================================
// CrankStats — derived from RiskEngine fields for dashboard display
// ============================================================================
export interface CrankStats {
    lastCrankSlot: number;
    maxCrankStalenessSlots: number;
    liqCursor: number;
    gcCursor: number;
    crankCursor: number;
    lastFullSweepStartSlot: number;
    lastFullSweepCompletedSlot: number;
    sweepStartIdx: number;
    lifetimeLiquidations: number;
    lifetimeForceRealizeCloses: number;
}

// ============================================================================
// EngineState — mirrors pub struct RiskEngine (lines 303-429)
// ============================================================================
export interface EngineState {
    /** vault: U128 — Total vault balance */
    vault: number;
    /** insurance_fund: InsuranceFund */
    insuranceFund: InsuranceFund;
    /** params: RiskParams */
    params: RiskParams;
    /** current_slot: u64 */
    currentSlot: number;
    /** funding_index_qpb_e6: I128 — Global funding index (1e6 scale) */
    fundingIndexQpbE6: number;
    /** last_funding_slot: u64 */
    lastFundingSlot: number;
    /** funding_rate_bps_per_slot_last: i64 — Anti-retroactive rate */
    fundingRateBpsPerSlotLast: number;
    /** total_open_interest: U128 — Σ abs(position_size) */
    totalOpenInterest: number;
    /** c_tot: U128 — Σ C_i (maintained incrementally via set_capital) */
    cTot: number;
    /** pnl_pos_tot: U128 — Σ max(PNL_i, 0) (maintained via set_pnl) */
    pnlPosTot: number;
    /** num_used_accounts: u16 — O(1) counter */
    numUsedAccounts: number;
    /** next_account_id: u64 — Monotonically increasing, never recycled */
    nextAccountId: number;
    /** Crank and sweep tracking */
    crankStats: CrankStats;
    /** net_lp_pos: I128 — Net LP position (Σ LP position_size) */
    netLpPos: number;
    /** lp_sum_abs: U128 — Σ abs(LP position_size) */
    lpSumAbs: number;
    /** lp_max_abs: U128 — Max abs(LP position_size) (monotone upper bound) */
    lpMaxAbs: number;
}

// ============================================================================
// DashboardMetrics — derived metrics for the UI
// ============================================================================
export interface DashboardMetrics {
    vaultBalance: number;
    insuranceBalance: number;
    insuranceFeeRevenue: number;
    totalCapital: number;
    totalPositivePnl: number;
    totalOpenInterest: number;
    numAccounts: number;
    numLPs: number;
    numUsers: number;
    /** Residual = max(0, V - C_tot - I) per spec §3.2 */
    residual: number;
    /** h = min(Residual, PNL_pos_tot) / PNL_pos_tot per spec §3.2 */
    haircutRatio: number;
    fundingRate: number;
    /** Slots since last crank */
    crankFreshness: number;
    sweepComplete: boolean;
    /** Insurance fund below risk_reduction_threshold */
    riskReductionActive: boolean;
    lifetimeLiquidations: number;
    lifetimeForceRealizeCloses: number;
    accounts: PercolatorAccount[];
}

// ============================================================================
// Constants — from risk_engine.rs constants section (lines 30-68)
// ============================================================================
export const ENGINE_CONSTANTS = {
    /** MAX_ACCOUNTS (production) */
    MAX_ACCOUNTS: 4096,
    /** ACCOUNTS_PER_CRANK: u16 = 256 */
    ACCOUNTS_PER_CRANK: 256,
    /** LIQ_BUDGET_PER_CRANK: u16 = 120 */
    LIQ_BUDGET_PER_CRANK: 120,
    /** FORCE_REALIZE_BUDGET_PER_CRANK: u16 = 32 */
    FORCE_REALIZE_BUDGET_PER_CRANK: 32,
    /** GC_CLOSE_BUDGET: u32 = 32 */
    GC_CLOSE_BUDGET: 32,
    /** MAX_ORACLE_PRICE: u64 = 10^15 */
    MAX_ORACLE_PRICE: 1_000_000_000_000_000,
    /** MAX_POSITION_ABS: u128 = 10^20 */
    MAX_POSITION_ABS: BigInt("100000000000000000000"),
    /** BITMAP_WORDS = (MAX_ACCOUNTS + 63) / 64 */
    BITMAP_WORDS: 64,
    /** ACCOUNT_IDX_MASK = MAX_ACCOUNTS - 1 */
    ACCOUNT_IDX_MASK: 4095,
    /** Scale factor for funding index (1e6) */
    SCALE_FACTOR: 1_000_000,
} as const;
