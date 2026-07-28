interface SolanaProvider {
  isPhantom?: boolean;
  isSolflare?: boolean;
  publicKey: { toString(): string } | null;
  connect(): Promise<{ publicKey: { toString(): string } }>;
  disconnect(): Promise<void>;
  signAndSendTransaction(transaction: import("@solana/web3.js").Transaction): Promise<{ signature: string }>;
}

interface Window {
  solana?: SolanaProvider;
  solflare?: SolanaProvider;
}
