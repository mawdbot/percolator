// components/AccountsTable.tsx — Risk engine accounts table with sorting
'use client';

import { useState } from 'react';
import type { PercolatorAccount } from '@/lib/risk-engine';

interface AccountsTableProps {
    accounts: PercolatorAccount[];
}

type SortField = 'index' | 'kind' | 'capital' | 'pnl' | 'positionSize' | 'entryPrice';
type SortDir = 'asc' | 'desc';

function formatValue(val: number, decimals = 2): string {
    if (Math.abs(val) >= 1_000_000_000) return (val / 1_000_000_000).toFixed(decimals) + 'B';
    if (Math.abs(val) >= 1_000_000) return (val / 1_000_000).toFixed(decimals) + 'M';
    if (Math.abs(val) >= 1_000) return (val / 1_000).toFixed(decimals) + 'K';
    return val.toFixed(decimals);
}

function truncAddr(addr: string): string {
    if (!addr || addr === '0'.repeat(64) || addr === '') return '—';
    return addr.slice(0, 4) + '…' + addr.slice(-4);
}

export function AccountsTable({ accounts }: AccountsTableProps) {
    const [sortField, setSortField] = useState<SortField>('index');
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('desc');
        }
    };

    const sorted = [...accounts].sort((a, b) => {
        let cmp = 0;
        switch (sortField) {
            case 'index': cmp = a.index - b.index; break;
            case 'kind': cmp = a.kind.localeCompare(b.kind); break;
            case 'capital': cmp = a.capital - b.capital; break;
            case 'pnl': cmp = a.pnl - b.pnl; break;
            case 'positionSize': cmp = Math.abs(a.positionSize) - Math.abs(b.positionSize); break;
            case 'entryPrice': cmp = a.entryPrice - b.entryPrice; break;
        }
        return sortDir === 'asc' ? cmp : -cmp;
    });

    const sortIcon = (field: SortField) =>
        sortField === field ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

    return (
        <div style={{ maxHeight: '400px', overflowY: 'auto', borderRadius: 'var(--radius-md)' }}>
            <table className="data-table">
                <thead>
                    <tr>
                        <th onClick={() => toggleSort('index')} style={{ cursor: 'pointer' }}>
                            Idx{sortIcon('index')}
                        </th>
                        <th onClick={() => toggleSort('kind')} style={{ cursor: 'pointer' }}>
                            Type{sortIcon('kind')}
                        </th>
                        <th>Owner</th>
                        <th onClick={() => toggleSort('capital')} style={{ cursor: 'pointer' }}>
                            Capital{sortIcon('capital')}
                        </th>
                        <th onClick={() => toggleSort('pnl')} style={{ cursor: 'pointer' }}>
                            PnL{sortIcon('pnl')}
                        </th>
                        <th onClick={() => toggleSort('positionSize')} style={{ cursor: 'pointer' }}>
                            Position{sortIcon('positionSize')}
                        </th>
                        <th onClick={() => toggleSort('entryPrice')} style={{ cursor: 'pointer' }}>
                            Entry Price{sortIcon('entryPrice')}
                        </th>
                        <th>Warmup</th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.length === 0 ? (
                        <tr>
                            <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                                No accounts loaded — simulation data will appear here
                            </td>
                        </tr>
                    ) : (
                        sorted.map((acct) => (
                            <tr key={acct.index}>
                                <td style={{ color: 'var(--text-muted)' }}>#{acct.index}</td>
                                <td>
                                    <span className={`badge ${acct.kind === 'LP' ? 'lp' : 'user'}`}>{acct.kind}</span>
                                </td>
                                <td style={{ color: 'var(--text-accent)', fontSize: '0.7rem' }}>{truncAddr(acct.owner)}</td>
                                <td style={{ color: 'var(--accent-blue)' }}>{formatValue(acct.capital)}</td>
                                <td style={{ color: acct.pnl >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                                    {acct.pnl >= 0 ? '+' : ''}{formatValue(acct.pnl)}
                                </td>
                                <td>
                                    <span style={{ color: acct.positionSize > 0 ? 'var(--accent-emerald)' : acct.positionSize < 0 ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                                        {acct.positionSize > 0 ? 'LONG ' : acct.positionSize < 0 ? 'SHORT ' : '—'}
                                        {acct.positionSize !== 0 && formatValue(Math.abs(acct.positionSize))}
                                    </span>
                                </td>
                                <td>{acct.entryPrice > 0 ? formatValue(acct.entryPrice / 1e6, 4) : '—'}</td>
                                <td>
                                    {acct.warmupStartedAtSlot > 0 ? (
                                        <span className="stat-pill warning" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                                            Warming
                                        </span>
                                    ) : (
                                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
