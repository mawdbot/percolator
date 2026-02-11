"use client";

import { ReactNode } from "react";

// Stub: jupiverse-kit not installed.
// When you install jupiverse-kit, replace this with the real JupiverseKitProvider.
// npm install jupiverse-kit @jup-ag/wallet-adapter

type WalletProviderProps = { children: ReactNode };

export function WalletProvider({ children }: WalletProviderProps) {
  // Pass-through provider — wallet adapter will wrap children when jupiverse-kit is installed
  return <>{children}</>;
}
