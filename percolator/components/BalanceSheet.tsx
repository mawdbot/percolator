// components/BalanceSheet.tsx — Visual balance sheet breakdown
'use client';

interface BalanceSheetProps {
    vault: number;
    totalCapital: number;
    insurance: number;
    insuranceFees: number;
    residual: number;
    totalPositivePnl: number;
    haircutRatio: number;
}

function formatUSD(val: number): string {
    const scaled = val / 1e6; // Convert from 1e6 scale
    if (scaled >= 1_000_000_000) return '$' + (scaled / 1_000_000_000).toFixed(2) + 'B';
    if (scaled >= 1_000_000) return '$' + (scaled / 1_000_000).toFixed(2) + 'M';
    if (scaled >= 1_000) return '$' + (scaled / 1_000).toFixed(2) + 'K';
    return '$' + scaled.toFixed(2);
}

interface BarSegment {
    label: string;
    value: number;
    color: string;
}

function HorizontalBar({ segments, total }: { segments: BarSegment[]; total: number }) {
    if (total <= 0) return null;

    return (
        <div style={{ marginTop: '16px' }}>
            <div
                style={{
                    height: '28px',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    display: 'flex',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-primary)',
                }}
            >
                {segments.map((seg, i) => {
                    const pct = Math.max(0.5, (seg.value / total) * 100);
                    return (
                        <div
                            key={i}
                            className="tooltip-trigger"
                            data-tooltip={`${seg.label}: ${formatUSD(seg.value)}`}
                            style={{
                                width: `${pct}%`,
                                background: seg.color,
                                transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {pct > 8 && (
                                <span
                                    style={{
                                        fontSize: '0.6rem',
                                        fontWeight: 600,
                                        color: 'rgba(255,255,255,0.9)',
                                        whiteSpace: 'nowrap',
                                        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                                    }}
                                >
                                    {seg.label}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
                {segments.map((seg, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div
                            style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '3px',
                                background: seg.color,
                            }}
                        />
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                            {seg.label}: <strong style={{ color: 'var(--text-primary)' }}>{formatUSD(seg.value)}</strong>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function BalanceSheet({
    vault,
    totalCapital,
    insurance,
    insuranceFees,
    residual,
    totalPositivePnl,
    haircutRatio,
}: BalanceSheetProps) {
    const segments: BarSegment[] = [
        { label: 'Capital (C_tot)', value: totalCapital, color: 'var(--accent-blue)' },
        { label: 'Insurance', value: insurance, color: 'var(--accent-violet)' },
        { label: 'Residual', value: residual, color: 'var(--accent-emerald)' },
    ].filter(s => s.value > 0);

    return (
        <div className="card">
            <div className="card-header">
                <span className="card-title">🏦 Balance Sheet</span>
                <span className="stat-pill neutral">{formatUSD(vault)} Vault</span>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Invariant: No user can withdraw more than the vault balance sheet supports.
            </div>

            <HorizontalBar segments={segments} total={vault} />

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginTop: '20px',
                    padding: '16px',
                    background: 'rgba(10, 20, 40, 0.5)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-primary)',
                }}
            >
                <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '2px' }}>PNL_pos_tot</div>
                    <div className="mono" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-emerald)' }}>
                        {formatUSD(totalPositivePnl)}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Haircut Ratio (h)</div>
                    <div className="mono" style={{ fontSize: '0.9rem', fontWeight: 600, color: haircutRatio >= 0.95 ? 'var(--accent-emerald)' : haircutRatio >= 0.5 ? 'var(--accent-amber)' : 'var(--accent-rose)' }}>
                        {(haircutRatio * 100).toFixed(1)}%
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Fee Revenue</div>
                    <div className="mono" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-violet)' }}>
                        {formatUSD(insuranceFees)}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Residual (V-C-I)</div>
                    <div className="mono" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                        {formatUSD(residual)}
                    </div>
                </div>
            </div>
        </div>
    );
}
