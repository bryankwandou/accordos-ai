"use client";

import { useEffect, useState } from "react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Check, ExternalLink, Fingerprint, LoaderCircle, LogOut, PlugZap, ShieldCheck, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import type { TermValue } from "@/lib/negotiation/types";

export function WalletProof({ terms, ready }: { terms: Record<string, TermValue>; ready: boolean }) {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [proof, setProof] = useState<{ hash: string; signature: string; verified: boolean; slot?: number } | null>(null);
  const provider = () => window.solana ?? window.solflare;

  useEffect(() => {
    const wallet = provider();
    if (wallet?.publicKey) void setConnectedWallet(wallet.publicKey.toString());
  }, []);

  async function setConnectedWallet(publicKey: string) {
    setAddress(publicKey);
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    setBalance((await connection.getBalance(new PublicKey(publicKey))) / 1_000_000_000);
  }

  async function connect() {
    setError("");
    const wallet = provider();
    if (!wallet) { setError("Install Phantom or Solflare, switch it to devnet, then reload."); return; }
    try { await setConnectedWallet((await wallet.connect()).publicKey.toString()); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Wallet connection was cancelled"); }
  }

  async function disconnect() {
    await provider()?.disconnect();
    setAddress(""); setBalance(null); setProof(null); setError("");
  }

  async function requestAirdrop() {
    if (!address) return;
    setBusy(true); setError("");
    try {
      const connection = new Connection("https://api.devnet.solana.com", "confirmed");
      const signature = await connection.requestAirdrop(new PublicKey(address), 0.05 * 1_000_000_000);
      await connection.confirmTransaction(signature, "confirmed");
      await setConnectedWallet(address);
    } catch { setError("Public faucet rate-limited this request. Use faucet.solana.com with your connected address."); }
    finally { setBusy(false); }
  }

  async function anchor() {
    const wallet = provider();
    if (!wallet || !address) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/proof", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ terms, approvals: 2, walletAddress: address }) });
      const prepared = await response.json();
      if (!response.ok) throw new Error(prepared.error);
      const signed = await wallet.signAndSendTransaction(Transaction.from(Buffer.from(prepared.transaction, "base64")));
      const connection = new Connection("https://api.devnet.solana.com", "confirmed");
      await connection.confirmTransaction(signed.signature, "confirmed");
      const verification = await fetch("/api/proof/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ signature: signed.signature, hash: prepared.hash }) }).then((item) => item.json());
      setProof({ hash: prepared.hash, signature: signed.signature, verified: verification.verified, slot: verification.slot });
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Devnet transaction failed"); }
    finally { setBusy(false); }
  }

  return <motion.div className="wallet-proof" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
    {!address ? <button className="wallet-connect" onClick={connect}><Wallet size={16} /><span><b>Connect Solana wallet</b><small>Phantom or Solflare · Devnet</small></span><PlugZap size={15} /></button> : <div className="wallet-connected"><span><i /><b>{address.slice(0,4)}…{address.slice(-4)}</b><small>{balance?.toFixed(4) ?? "…"} DEVNET SOL</small></span><button aria-label="Disconnect wallet" onClick={disconnect}><LogOut size={14} /></button><ShieldCheck size={17} /></div>}
    {address && balance === 0 && <button className="wallet-airdrop" disabled={busy} onClick={requestAirdrop}>Request 0.05 devnet SOL</button>}
    {address && !proof && <button className="button proof-button" disabled={!ready || busy || balance === 0} onClick={anchor}>{busy ? <LoaderCircle className="spin" size={16} /> : <Fingerprint size={16} />}{!ready ? "Complete both approvals" : busy ? "Signing and verifying…" : "Sign devnet proof"}</button>}
    {proof && <div className={proof.verified ? "proof-card verified-proof" : "proof-card"}><b>{proof.verified ? <><Check size={13} /> Verified on Solana devnet</> : "Proof submitted, verification pending"}</b><code>{proof.signature}</code><span>Agreement hash {proof.hash.slice(0,12)}… · Slot {proof.slot ?? "pending"}</span><a target="_blank" rel="noreferrer" href={`https://explorer.solana.com/tx/${proof.signature}?cluster=devnet`}>Open Solana Explorer <ExternalLink size={12} /></a></div>}
    {error && <p className="wallet-error">{error}</p>}
  </motion.div>;
}
