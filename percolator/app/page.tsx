// app/page.tsx — Main Percolator Risk Engine Dashboard
'use client';

import { useState } from 'react';
import { StatCard } from '@/components/StatCard';
import { ClusterInfo } from '@/components/ClusterInfo';
import { BalanceSheet } from '@/components/BalanceSheet';
import { CrankStatus } from '@/components/CrankStatus';
import { AccountsTable } from '@/components/AccountsTable';
import { useRiskEngineSimulation } from '@/hooks/useRiskEngineSimulation';
import { ENGINE_CONSTANTS } from '@/lib/risk-engine';

function formatUSD(val: number): string {
    const scaled = val / 1e6;
    if (scaled >= 1_000_000_000) return '$' + (scaled / 1_000_000_000).toFixed(2) + 'B';
    if (scaled >= 1_000_000) return '$' + (scaled / 1_000_000).toFixed(2) + 'M';
    if (scaled >= 1_000) return '$' + (scaled / 1_000).toFixed(2) + 'K';
    return '$' + scaled.toFixed(2);
}

type Tab = 'overview' | 'accounts' | 'spec';

export default function PercolatorDashboard() {
    const { metrics, isSimulating, currentSlot } = useRiskEngineSimulation();
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    return (
        <main className="page-container">
            {/* Hero Header */}
            <div className="hero-header fade-in-up">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 className="hero-title">☕ Percolator</h1>
                        <p className="hero-subtitle">
                            Formally Verified Risk Engine for Perpetual DEXs on Solana
                        </p>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                            <span className="stat-pill neutral">⚠️ Educational Research</span>
                            <span className="stat-pill positive">
                                <span className="status-dot live" />
                                RPC Connected
                            </span>
                            {isSimulating && (
                                <span className="stat-pill warning">
                                    <span className="status-dot stale" />
                                    Simulation Active
                                </span>
                            )}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>MAX_ACCOUNTS</div>
                        <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-accent)' }}>
                            {ENGINE_CONSTANTS.MAX_ACCOUNTS.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Warning Banner */}
            <div className="warning-banner fade-in-up" style={{ marginBottom: '24px' }}>
                ⚠️ This is an <strong>educational research project</strong> — NOT production ready. Do NOT use with real funds. Engine simulation only.
            </div>

            {/* Navigation Tabs */}
            <div className="nav-tabs fade-in-up" style={{ marginBottom: '24px' }}>
                <button className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                    Overview
                </button>
                <button className={`nav-tab ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>
                    Accounts
                </button>
                <button className={`nav-tab ${activeTab === 'spec' ? 'active' : ''}`} onClick={() => setActiveTab('spec')}>
                    Engine Spec
                </button>
            </div>

            {activeTab === 'overview' && (
                <>
                    {/* Stat Grid */}
                    <div className="grid-4" style={{ marginBottom: '24px' }}>
                        <StatCard
                            label="Vault Balance"
                            value={metrics ? formatUSD(metrics.vaultBalance) : '—'}
                            icon="🏦"
                            color="blue"
                            animDelay={0.05}
                            tooltip="Total deposited funds in vault"
                        />
                        <StatCard
                            label="Insurance Fund"
                            value={metrics ? formatUSD(metrics.insuranceBalance) : '—'}
                            icon="🛡️"
                            color="violet"
                            trend={metrics?.riskReductionActive ? 'down' : 'up'}
                            trendValue={metrics?.riskReductionActive ? 'Depleted' : 'Healthy'}
                            animDelay={0.1}
                            tooltip="Buffer for socialized losses"
                        />
                        <StatCard
                            label="Open Interest"
                            value={metrics ? formatUSD(metrics.totalOpenInterest) : '—'}
                            icon="📊"
                            color="cyan"
                            animDelay={0.15}
                            tooltip="Sum of abs(position_size) across all accounts"
                        />
                        <StatCard
                            label="Active Accounts"
                            value={metrics ? metrics.numAccounts.toString() : '—'}
                            suffix={metrics ? `(${metrics.numLPs} LP / ${metrics.numUsers} User)` : ''}
                            icon="👥"
                            color="emerald"
                            animDelay={0.2}
                            tooltip="Occupied slots in the account slab"
                        />
                    </div>

                    {/* Cluster Info + Balance Sheet */}
                    <div className="grid-2" style={{ marginBottom: '24px' }}>
                        <ClusterInfo />
                    </div>

                    <div className="grid-2" style={{ marginBottom: '24px' }}>
                        {metrics && (
                            <BalanceSheet
                                vault={metrics.vaultBalance}
                                totalCapital={metrics.totalCapital}
                                insurance={metrics.insuranceBalance}
                                insuranceFees={metrics.insuranceFeeRevenue}
                                residual={metrics.residual}
                                totalPositivePnl={metrics.totalPositivePnl}
                                haircutRatio={metrics.haircutRatio}
                            />
                        )}

                        {metrics && (
                            <CrankStatus
                                crankFreshness={metrics.crankFreshness}
                                sweepComplete={metrics.sweepComplete}
                                lifetimeLiquidations={metrics.lifetimeLiquidations}
                                lifetimeForceRealizeCloses={metrics.lifetimeForceRealizeCloses}
                                riskReductionActive={metrics.riskReductionActive}
                                fundingRate={metrics.fundingRate}
                                numAccounts={metrics.numAccounts}
                                currentSlot={currentSlot}
                            />
                        )}
                    </div>

                    {/* Risk Parameters */}
                    <div className="card fade-in-up fade-in-up-4" style={{ marginBottom: '24px' }}>
                        <div className="card-header">
                            <span className="card-title">📐 Risk Parameters</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                            {[
                                { label: 'Warmup Period', value: '150 slots', desc: 'PnL warmup time T' },
                                { label: 'Maintenance Margin', value: '5.00%', desc: '500 bps' },
                                { label: 'Initial Margin', value: '10.00%', desc: '1000 bps' },
                                { label: 'Trading Fee', value: '0.10%', desc: '10 bps' },
                                { label: 'Liquidation Fee', value: '0.50%', desc: '50 bps' },
                                { label: 'Liq Buffer', value: '1.00%', desc: '100 bps above maintenance' },
                                { label: 'Crank Staleness', value: '100 slots', desc: 'Max slots before stale' },
                                { label: 'Accounts/Crank', value: '256', desc: 'ACCOUNTS_PER_CRANK' },
                                { label: 'Liq Budget/Crank', value: '120', desc: 'LIQ_BUDGET_PER_CRANK' },
                                { label: 'Force Realize Budget', value: '32', desc: 'FORCE_REALIZE_BUDGET_PER_CRANK' },
                                { label: 'GC Close Budget', value: '32', desc: 'GC_CLOSE_BUDGET' },
                                { label: 'Max Oracle Price', value: '$1B', desc: '10^15 with 6 decimals' },
                            ].map((param) => (
                                <div
                                    key={param.label}
                                    style={{
                                        padding: '12px 16px',
                                        background: 'rgba(10, 20, 40, 0.5)',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--border-primary)',
                                    }}
                                >
                                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                                        {param.label}
                                    </div>
                                    <div className="mono" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-accent)' }}>
                                        {param.value}
                                    </div>
                                    <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                        {param.desc}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'accounts' && (
                <div className="card fade-in-up">
                    <div className="card-header">
                        <span className="card-title">📋 Account Slab ({metrics?.numAccounts ?? 0} occupied)</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <span className="badge lp">{metrics?.numLPs ?? 0} LP</span>
                            <span className="badge user">{metrics?.numUsers ?? 0} User</span>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                        Fixed slab with bitmap allocation. Each slot holds an <code className="mono" style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>Account</code> struct — user or LP.
                        Click column headers to sort.
                    </p>
                    <AccountsTable accounts={metrics?.accounts ?? []} />
                </div>
            )}

            {activeTab === 'spec' && (
                <div className="card fade-in-up">
                    <div className="card-header">
                        <span className="card-title">📜 Engine Specification</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                        <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>
                            Security Claim
                        </h3>
                        <blockquote style={{
                            padding: '16px 24px',
                            borderLeft: '3px solid var(--accent-blue)',
                            background: 'rgba(59, 130, 246, 0.05)',
                            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                            marginBottom: '24px',
                            fontStyle: 'italic',
                        }}>
                            No sequence of trades, oracle updates, funding accruals, warmups, ADL/socialization,
                            panic settles, force-realize scans, or withdrawals can allow net extraction beyond what
                            is funded by others' realized losses and spendable insurance.
                        </blockquote>

                        <h3 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700, marginBottom: '8px', marginTop: '24px' }}>
                            Core Invariants
                        </h3>
                        <div style={{ display: 'grid', gap: '8px' }}>
                            {[
                                { id: 'I1', text: 'User capital is NEVER reduced by ADL/socialization' },
                                { id: 'I2', text: 'PNL warmup prevents instant withdrawal of manipulated profits' },
                                { id: 'I3', text: 'ADL haircuts apply to unwarmed PNL first, protecting principal' },
                                { id: 'I4', text: 'Conservation of funds across all operations' },
                                { id: 'I5', text: 'User isolation — one user\'s actions don\'t affect others\' capital' },
                            ].map(inv => (
                                <div key={inv.id} style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '12px',
                                    padding: '10px 16px',
                                    background: 'rgba(10, 20, 40, 0.5)',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border-primary)',
                                }}>
                                    <span className="mono" style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        color: 'var(--accent-emerald)',
                                        padding: '2px 6px',
                                        background: 'rgba(52, 211, 153, 0.1)',
                                        borderRadius: '4px',
                                        flexShrink: 0,
                                    }}>
                                        {inv.id}
                                    </span>
                                    <span>{inv.text}</span>
                                </div>
                            ))}
                        </div>

                        <h3 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700, marginBottom: '8px', marginTop: '24px' }}>
                            Architecture
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {[
                                { title: 'Variation Margin', desc: 'Positions settled to oracle mark before mutation, making positions fungible across LPs' },
                                { title: 'Pluggable Matching', desc: 'LPs provide a MatchingEngine that can implement AMM/RFQ/CLOB logic and reject trades' },
                                { title: 'Oracle-Price Liquidation', desc: 'Liquidations close positions at oracle price without requiring counterparty LP' },
                                { title: 'Cursor-Based Crank', desc: 'Bounded scan with ACCOUNTS_PER_CRANK budget, sweep completion detection on wrap' },
                                { title: 'PnL Warmup', desc: 'Profits vest linearly over warmup_period_slots, preventing oracle manipulation extraction' },
                                { title: 'ADL Waterfall', desc: 'Auto-deleverage with haircut ratio h = min(Residual, PNL_pos_tot) / PNL_pos_tot' },
                            ].map(item => (
                                <div key={item.title} style={{
                                    padding: '16px',
                                    background: 'rgba(10, 20, 40, 0.5)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-primary)',
                                }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '4px' }}>
                                        {item.title}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                        {item.desc}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h3 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700, marginBottom: '8px', marginTop: '24px' }}>
                            Formal Verification
                        </h3>
                        <div style={{
                            padding: '16px 20px',
                            background: 'rgba(10, 20, 40, 0.5)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-primary)',
                        }}>
                            <p>Kani harnesses verify key invariants including conservation, isolation, and no-teleport behavior for cross-LP closes.</p>
                            <div className="mono" style={{
                                marginTop: '12px',
                                padding: '12px 16px',
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem',
                                color: 'var(--accent-emerald)',
                                lineHeight: 1.7,
                            }}>
                                <div style={{ color: 'var(--text-muted)' }}>$ cargo install --locked kani-verifier</div>
                                <div style={{ color: 'var(--text-muted)' }}>$ cargo kani setup</div>
                                <div>$ cargo kani</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer style={{
                marginTop: '40px',
                padding: '20px 0',
                borderTop: '1px solid var(--border-primary)',
                textAlign: 'center',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
            }}>
                <p>Percolator Risk Engine — Apache-2.0 License — Educational Research Only</p>
                <p style={{ marginTop: '4px' }}>
                    Powered by Helius RPC • Solana Mainnet • {new Date().getFullYear()}
                </p>
            </footer>
        </main>
    );
}
