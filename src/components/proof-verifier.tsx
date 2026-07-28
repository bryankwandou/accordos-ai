"use client";

import { useState } from "react";
import { Check, ExternalLink, LoaderCircle, Search, ShieldX } from "lucide-react";
import { motion } from "framer-motion";

export function ProofVerifier() {
  const [signature, setSignature] = useState("58Lk51jNa68RnMCgwVxMnZBE5FnwTVcyqGWebi9v4wFZKES8vMeR8ft2ssom5stkVFuMvEfpDiKHhrexSq3kM41G");
  const [hash, setHash] = useState("82dc196df69129f98f33bb46297569b3169f45c37c0fbee6a5b6419d5589703f");
  const [result, setResult] = useState<{ verified: boolean; reason?: string; slot?: number } | null>(null);
  const [busy, setBusy] = useState(false);
  async function verify() {
    setBusy(true); setResult(null);
    const response = await fetch("/api/proof/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ signature, hash }) });
    setResult(await response.json()); setBusy(false);
  }
  return <div className="verifier-card"><label>Devnet transaction signature<input value={signature} onChange={(event) => setSignature(event.target.value.trim())} /></label><label>Expected agreement hash<input value={hash} onChange={(event) => setHash(event.target.value.trim())} /></label><button className="button" onClick={verify} disabled={busy}>{busy ? <LoaderCircle className="spin" size={16} /> : <Search size={16} />} Verify on devnet</button>{result && <motion.div className={result.verified ? "verification-result valid-result" : "verification-result invalid-result"} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>{result.verified ? <Check /> : <ShieldX />}<span><b>{result.verified ? "Cryptographic proof verified" : "Proof did not match"}</b><small>{result.verified ? `Confirmed in slot ${result.slot}` : result.reason}</small></span>{result.verified && <a target="_blank" rel="noreferrer" href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}>Explorer <ExternalLink size={12} /></a>}</motion.div>}</div>;
}
