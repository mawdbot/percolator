import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: true,
    env: {
        RPC_URL: process.env.RPC_URL,
        HELIUS_API_KEY: process.env.HELIUS_API_KEY,
    },
};

export default nextConfig;
