import "@/globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Percolator — Risk Engine Dashboard",
  description:
    "Formally verified accounting & risk engine for perpetual futures DEXs on Solana. Educational research project.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#050a14" />
      </head>
      <body>{children}</body>
    </html>
  );
}
