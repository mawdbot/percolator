// components/ClusterInfo.tsx — Live Solana cluster info from Helius RPC
'use client';

import { useEffect, useState } from 'react';
import { GaugeRing } from './GaugeRing';

interface ClusterData {
    slot: number;
    blockHeight: number;
    epoch: number;
    epochProgress: number;
    slotsInEpoch: number;
    slotIndex: number;
    totalSupply: number;
    circulatingSupply: number;
    solanaVersion: string;
    tps: number | null;
}

function formatLamports(lamports: number): string {
    const sol = lamports / 1e9;
    if (sol >= 1_000_000_000) return (sol / 1_000_000_000).toFixed(2) + 'B';
    if (sol >= 1_000_000) return (sol / 1_000_000).toFixed(2) + 'M';
    return sol.toFixed(2);
}

export function ClusterInfo() {
    const [data, setData] = useState<ClusterData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    useEffect(() => {
        const fetchCluster = async () => {
            try {
                const res = await fetch('/api/solana/cluster', { cache: 'no-store' });
                const json = await res.json();
                if (!json.ok) throw new Error(json.error);
                setData(json.data);
                setLastUpdate(new Date());
                setError(null);
            } catch (e: any) {
                setError(e.message);
            }
        };

        fetchCluster();
        const interval = setInterval(fetchCluster, 15_000);
        return () => clearInterval(interval);
    }, []);

    if (error) {
        return (
            <div className="card" style={{ gridColumn: 'span 2' }}>
                <div className="card-header">
                    <span className="card-title">⚠️ Solana Cluster</span>
                </div>
                <p style={{ color: 'var(--accent-rose)', fontSize: '0.8rem' }}>
                    RPC Error: {error}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '8px' }}>
                    Check your RPC_URL in .env
                </p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="card" style={{ gridColumn: 'span 2' }}>
                <div className="card-header">
                    <span className="card-title">Solana Cluster</span>
                    <span className="stat-pill neutral">Connecting…</span>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div className="skeleton" style={{ width: '100%', height: '80px' }} />
                </div>
            </div>
        );
    }

    return (
        <div className="card" style={{ gridColumn: 'span 2' }}>
            <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="card-title">Solana Cluster</span>
                    <span className="stat-pill positive">
                        <span className="status-dot live" />
                        {data.solanaVersion}
                    </span>
                </div>
                {lastUpdate && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        Updated {lastUpdate.toLocaleTimeString()}
                    </span>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px', alignItems: 'center' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Slot</div>
                        <div className="mono" style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-accent)' }}>
                            {data.slot.toLocaleString()}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Block Height</div>
                        <div className="mono" style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {data.blockHeight.toLocaleString()}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Epoch</div>
                        <div className="mono" style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-violet)' }}>
                            {data.epoch}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '2px' }}>TPS</div>
                        <div className="mono" style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                            {data.tps ? data.tps.toLocaleString() : '—'}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Total Supply</div>
                        <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                            ◎ {formatLamports(data.totalSupply)}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Circulating</div>
                        <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                            ◎ {formatLamports(data.circulatingSupply)}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <GaugeRing
                        value={data.epochProgress}
                        size={100}
                        strokeWidth={7}
                        color="var(--accent-indigo)"
                        unit="%"
                    />
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Epoch Progress</span>
                </div>
            </div>
        </div>
    );
}
