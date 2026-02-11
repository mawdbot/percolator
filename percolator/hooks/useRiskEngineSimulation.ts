// hooks/useRiskEngineSimulation.ts
// Simulates the Percolator risk engine state for the dashboard
// Since Percolator is a Rust library (not a deployed program), we simulate
// realistic engine state to demonstrate the dashboard capabilities.
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DashboardMetrics, PercolatorAccount } from '@/lib/risk-engine';

function randomBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

function generateAccounts(count: number): PercolatorAccount[] {
    const accounts: PercolatorAccount[] = [];
    const lpCount = Math.max(2, Math.floor(count * 0.15));

    for (let i = 0; i < count; i++) {
        const isLP = i < lpCount;
        const capital = isLP
            ? randomBetween(50_000, 500_000) * 1e6
            : randomBetween(100, 50_000) * 1e6;
        const hasPosition = Math.random() > 0.3;
        const posSize = hasPosition
            ? (Math.random() > 0.5 ? 1 : -1) * randomBetween(100, isLP ? 100_000 : 10_000) * 1e6
            : 0;
        const pnl = hasPosition
            ? (Math.random() > 0.4 ? 1 : -1) * randomBetween(0, capital * 0.15)
            : 0;

        accounts.push({
            index: i,
            accountId: 1000 + i,
            kind: isLP ? 'LP' : 'User',
            capital: Math.floor(capital),
            pnl: Math.floor(pnl),
            reservedPnl: 0,
            positionSize: Math.floor(posSize),
            entryPrice: hasPosition ? Math.floor(randomBetween(80, 200) * 1e6) : 0,
            warmupStartedAtSlot: Math.random() > 0.85 ? Math.floor(randomBetween(280_000_000, 290_000_000)) : 0,
            warmupSlopePerStep: 0,
            fundingIndex: 0,
            feeCredits: Math.floor(randomBetween(0, 1000) * 1e6),
            lastFeeSlot: Math.floor(randomBetween(290_000_000, 295_000_000)),
            owner: Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join(''),
        });
    }

    return accounts;
}

function computeMetrics(accounts: PercolatorAccount[], currentSlot: number): DashboardMetrics {
    let totalCapital = 0;
    let totalPositivePnl = 0;
    let totalOpenInterest = 0;
    let numLPs = 0;
    let numUsers = 0;
    let insuranceBalance = 0;
    let insuranceFeeRevenue = 0;

    for (const acct of accounts) {
        totalCapital += acct.capital;
        if (acct.pnl > 0) totalPositivePnl += acct.pnl;
        totalOpenInterest += Math.abs(acct.positionSize);
        if (acct.kind === 'LP') numLPs++;
        else numUsers++;
    }

    // Simulate insurance fund (10-20% of total capital)
    insuranceBalance = Math.floor(totalCapital * randomBetween(0.1, 0.2));
    insuranceFeeRevenue = Math.floor(totalCapital * randomBetween(0.01, 0.05));

    const vaultBalance = totalCapital + insuranceBalance;
    const residual = Math.max(0, vaultBalance - totalCapital - insuranceBalance);
    const haircutRatio = totalPositivePnl > 0
        ? Math.min(residual, totalPositivePnl) / totalPositivePnl
        : 1;

    const riskReductionThreshold = totalCapital * 0.05;

    return {
        vaultBalance,
        insuranceBalance,
        insuranceFeeRevenue,
        totalCapital,
        totalPositivePnl,
        totalOpenInterest,
        numAccounts: accounts.length,
        numLPs,
        numUsers,
        residual,
        haircutRatio,
        fundingRate: randomBetween(-5, 5),
        crankFreshness: Math.floor(randomBetween(0, 50)),
        sweepComplete: Math.random() > 0.3,
        riskReductionActive: insuranceBalance < riskReductionThreshold,
        lifetimeLiquidations: Math.floor(randomBetween(0, 150)),
        lifetimeForceRealizeCloses: Math.floor(randomBetween(0, 20)),
        accounts,
    };
}

export function useRiskEngineSimulation() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const [currentSlot, setCurrentSlot] = useState(295_000_000);

    const startSimulation = useCallback(() => {
        setIsSimulating(true);
        const accts = generateAccounts(24);
        setMetrics(computeMetrics(accts, currentSlot));
    }, [currentSlot]);

    // Auto-start simulation
    useEffect(() => {
        const timer = setTimeout(() => {
            startSimulation();
        }, 800);
        return () => clearTimeout(timer);
    }, [startSimulation]);

    // Tick the simulation every 5 seconds to simulate crank updates
    useEffect(() => {
        if (!isSimulating || !metrics) return;

        const interval = setInterval(() => {
            setCurrentSlot((s) => s + Math.floor(randomBetween(2, 8)));

            // Mutate PnL slightly to simulate market movements
            const updatedAccounts = metrics.accounts.map((acct) => {
                if (acct.positionSize === 0) return acct;
                const pnlDrift = (Math.random() > 0.5 ? 1 : -1) * randomBetween(0, acct.capital * 0.01);
                return {
                    ...acct,
                    pnl: Math.floor(acct.pnl + pnlDrift),
                };
            });

            setMetrics(computeMetrics(updatedAccounts, currentSlot));
        }, 5000);

        return () => clearInterval(interval);
    }, [isSimulating, metrics, currentSlot]);

    return { metrics, isSimulating, currentSlot, startSimulation };
}
