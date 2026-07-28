import { Header } from "@/components/header";
import { ProofVerifier } from "@/components/proof-verifier";

export default function VerifyPage() {
  return <main><div className="hero-shell compact-shell"><Header /><section className="page-hero"><span className="eyebrow">PUBLIC PROOF VERIFIER</span><h1>Trust the receipt,<br /><em>then check the chain.</em></h1><p>Verify two organization signatures, exact agreement content, and the matching Solana devnet transaction without trusting AccordOS.</p></section></div><section className="section verifier-section"><div><span className="eyebrow dark-eye">THREE-LAYER CHECK</span><h2>Verify every trust boundary.</h2><p>Upload an AccordOS receipt to verify both wallet approvals, the signed agreement hash, and its confirmed devnet memo. The known on-chain proof remains preloaded for direct hash verification.</p></div><ProofVerifier /></section></main>;
}
