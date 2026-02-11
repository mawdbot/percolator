"use client";

// Stub WalletConnectButton — Jupiter wallet adapter integration pending.
// When @jup-ag/wallet-adapter is installed, this will be replaced with
// the real UnifiedWalletButton.

export function WalletConnectButton() {
  return (
    <button
      style={{
        padding: "6px 16px",
        borderRadius: "999px",
        border: "1px solid rgba(148, 163, 184, 0.3)",
        background: "rgba(15, 23, 42, 0.8)",
        color: "#e2e8f0",
        fontSize: "0.75rem",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLButtonElement).style.borderColor = "#34d399";
        (e.target as HTMLButtonElement).style.color = "#6ee7b7";
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLButtonElement).style.borderColor = "rgba(148, 163, 184, 0.3)";
        (e.target as HTMLButtonElement).style.color = "#e2e8f0";
      }}
      onClick={() => {
        alert("Wallet adapter not installed.\n\nnpm install jupiverse-kit @jup-ag/wallet-adapter\n\nSee: https://github.com/nicklhw/jupiverse-kit");
      }}
    >
      Connect Wallet
    </button>
  );
}
