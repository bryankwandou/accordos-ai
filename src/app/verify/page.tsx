import { Header } from "@/components/header";
import { ProofVerifier } from "@/components/proof-verifier";

export default function VerifyPage() {
  return <main><div className="hero-shell compact-shell"><Header /><section className="page-hero"><span className="eyebrow">PUBLIC PROOF VERIFIER</span><h1>Trust the transaction,<br /><em>not our claim.</em></h1><p>Read a confirmed Solana devnet transaction and match its AccordOS memo against the expected agreement hash.</p></section></div><section className="section verifier-section"><div><span className="eyebrow dark-eye">LIVE DEVNET CHECK</span><h2>Verify a proof independently.</h2><p>The known working transaction is preloaded. Change one character in the hash to prove that mismatches fail.</p></div><ProofVerifier /></section></main>;
}
