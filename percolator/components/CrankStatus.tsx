// components/CrankStatus.tsx — Keeper crank monitoring panel
'use client';

import { GaugeRing } from './GaugeRing';
import { ENGINE_CONSTANTS } from '@/lib/risk-engine';

interface CrankStatusProps {
    crankFreshness: number;
    sweepComplete: boolean;
    lifetimeLiquidations: number;
    lifetimeForceRealizeCloses: number;
    riskReductionActive: boolean;
    fundingRate: number;
    numAccounts: number;
    currentSlot: number;
}

export function CrankStatus({
    crankFreshness,
    sweepComplete,
    lifetimeLiquidations,
    lifetimeForceRealizeCloses,
    riskReductionActive,
    fundingRate,
    numAccounts,
    currentSlot,
}: CrankStatusProps) {
    const cranksNeeded = Math.ceil(numAccounts / ENGINE_CONSTANTS.ACCOUNTS_PER_CRANK);
    const freshnessPct = Math.min(100, (crankFreshness / 100) * 100);

    return (
        <div className="card">
            <div className="card-header">
                <span className="card-title">⚙️ Keeper Crank</span>
                <span className={`stat-pill ${sweepComplete ? 'positive' : 'warning'}`}>
                    {sweepComplete ? 'Sweep Complete' : 'Sweeping…'}
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '24px', alignItems: 'center' }}>
                <GaugeRing
                    value={100 - freshnessPct}
                    size={90}
                    strokeWidth={6}
                    color={freshnessPct < 50 ? 'var(--accent-emerald)' : freshnessPct < 80 ? 'var(--accent-amber)' : 'var(--accent-rose)'}
                    unit="fresh"
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Slots Since Crank</div>
                        <div className="mono" style={{
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            color: crankFreshness < 50 ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                        }}>
                            {crankFreshness}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Current Slot</div>
                        <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {currentSlot.toLocaleString()}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Cranks Per Sweep</div>
                        <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                            {cranksNeeded}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Funding Rate</div>
                        <div className="mono" style={{
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            color: fundingRate >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                        }}>
                            {fundingRate >= 0 ? '+' : ''}{fundingRate.toFixed(2)} bps/slot
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom stats strip */}
            <div
                style={{
                    display: 'flex',
                    gap: '16px',
                    marginTop: '16px',
                    padding: '12px 16px',
                    background: 'rgba(10, 20, 40, 0.5)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-primary)',
                }}
            >
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Lifetime Liquidations</div>
                    <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-rose)' }}>
                        {lifetimeLiquidations}
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Force Realize Closes</div>
                    <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
                        {lifetimeForceRealizeCloses}
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Risk Reduction</div>
                    <div style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: riskReductionActive ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                    }}>
                        {riskReductionActive ? '🔴 ACTIVE' : '🟢 Normal'}
                    </div>
                </div>
            </div>

            {riskReductionActive && (
                <div className="warning-banner" style={{ marginTop: '12px' }}>
                    ⚠️ Risk reduction mode is active — insurance fund is depleted. Only risk-reducing trades are permitted.
                </div>
            )}
        </div>
    );
}
