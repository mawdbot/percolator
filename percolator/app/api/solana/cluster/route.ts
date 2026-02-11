// app/api/solana/cluster/route.ts — Fetch cluster info via Helius RPC
import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/solana';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const conn = getConnection();

        const [slot, blockHeight, epochInfo, supply, version] = await Promise.all([
            conn.getSlot(),
            conn.getBlockHeight(),
            conn.getEpochInfo(),
            conn.getSupply({ excludeNonCirculatingAccountsList: true }),
            conn.getVersion(),
        ]);

        const tps = await conn
            .getRecentPerformanceSamples(1)
            .then((s) => (s[0] ? Math.round(s[0].numTransactions / s[0].samplePeriodSecs) : null))
            .catch(() => null);

        return NextResponse.json({
            ok: true,
            data: {
                slot,
                blockHeight,
                epoch: epochInfo.epoch,
                epochProgress: Number(
                    ((epochInfo.slotIndex / epochInfo.slotsInEpoch) * 100).toFixed(2)
                ),
                slotsInEpoch: epochInfo.slotsInEpoch,
                slotIndex: epochInfo.slotIndex,
                totalSupply: supply.value.total,
                circulatingSupply: supply.value.circulating,
                nonCirculatingSupply: supply.value.nonCirculating,
                solanaVersion: version['solana-core'],
                tps,
            },
        });
    } catch (error: any) {
        console.error('Cluster info error:', error);
        return NextResponse.json(
            { ok: false, error: error.message || 'Failed to fetch cluster info' },
            { status: 500 }
        );
    }
}
