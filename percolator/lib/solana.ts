// lib/solana.ts — Solana RPC connection using Helius from .env
import { Connection, clusterApiUrl } from '@solana/web3.js';

const RPC_URL = process.env.RPC_URL
    || process.env.HELIUS_RPC_URL
    || clusterApiUrl('mainnet-beta');

let _connection: Connection | null = null;

export function getConnection(): Connection {
    if (!_connection) {
        _connection = new Connection(RPC_URL, {
            commitment: 'confirmed',
            confirmTransactionInitialTimeout: 60_000,
        });
    }
    return _connection;
}

export { RPC_URL };
