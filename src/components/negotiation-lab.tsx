"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  CircleStop,
  ExternalLink,
  Fingerprint,
  LockKeyhole,
  Play,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import type { NegotiationTurn, TermValue } from "@/lib/negotiation/types";

interface DemoResponse {
  turns: NegotiationTurn[];
  converged: boolean;
  finalTerms?: Record<string, TermValue>;
  source: "deterministic" | "groq";
}

export function NegotiationLab() {
  const [result, setResult] = useState<DemoResponse | null>(null);
  const [running, setRunning] = useState(false);
  const [proof, setProof] = useState<{ hash: string; signature?: string; mode: string } | null>(null);
  const [approvals, setApprovals] = useState(0);

  async function run() {
    setRunning(true);
    setResult(null);
    setProof(null);
    setApprovals(0);
    const response = await fetch("/api/negotiate", { method: "POST" });
    setResult(await response.json());
    setRunning(false);
  }

  async function anchor() {
    if (!result?.finalTerms) return;
    const response = await fetch("/api/proof", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ terms: result.finalTerms, approvals: 2 }),
    });
    setProof(await response.json());
  }

  return (
    <main className="lab-shell">
      <header className="lab-topbar">
        <Link href="/"><ArrowLeft size={17} /> AccordOS</Link>
        <div><span className="status-dot" /> Demo environment</div>
        <Link href="/dashboard">Analytics <ExternalLink size={14} /></Link>
      </header>
      <section className="lab-heading">
        <div>
          <span className="eyebrow dark-eye">LIVE NEGOTIATION ROOM</span>
          <h1>Northstar × Helio</h1>
          <p>SaaS subscription renewal · Maximum 12 rounds</p>
        </div>
        <button className="button" onClick={run} disabled={running}>
          {running ? <CircleStop className="spin" size={17} /> : <Play size={17} />}
          {running ? "Agents negotiating…" : result ? "Run again" : "Start agents"}
        </button>
      </section>
      <section className="lab-grid">
        <aside className="constraint-panel">
          <div className="panel-title"><LockKeyhole size={16} /><span>Your private authority</span></div>
          <p>Only Northstar’s agent and deterministic validator can access these limits.</p>
          {[
            ["Annual price", "≤ $45,000", "Critical"],
            ["Contract term", "≤ 24 months", "High"],
            ["Payment terms", "≥ Net 30", "Flexible"],
            ["Support", "≥ 20 hrs/mo", "High"],
          ].map(([label, value, priority]) => (
            <div className="constraint-row" key={label}>
              <span>{label}<small>{priority}</small></span><b>{value}</b>
            </div>
          ))}
          <div className="hard-term"><ShieldCheck size={15} /><span><b>Hard requirement</b>No automatic renewal</span></div>
          <div className="privacy-note"><Fingerprint size={18} /><span><b>Encrypted at rest</b>AES-256-GCM with organization-bound keys.</span></div>
        </aside>
        <div className="transcript-panel">
          <div className="panel-title">
            <span>Shared transcript</span>
            <span className="source-tag"><Sparkles size={13} /> {result?.source === "groq" ? "Groq agent" : "Guardrail simulation"}</span>
          </div>
          {!result && !running && (
            <div className="lab-empty"><span className="orb"><i /><i /></span><h2>Boundaries are loaded</h2><p>Start the agents to watch every offer pass through the same deterministic authority check.</p></div>
          )}
          {running && (
            <div className="lab-empty"><span className="scan-orb" /><h2>Agents are finding common ground</h2><p>Private limits stay separated while proposed terms are validated.</p></div>
          )}
          {result && (
            <div className="turn-list">
              {result.turns.map((turn, index) => (
                <article className={`lab-turn ${turn.side}`} key={turn.id} style={{ animationDelay: `${index * 160}ms` }}>
                  <div><span className={`avatar ${turn.side === "buyer" ? "dark" : "lime"}`}>{turn.company[0]}</span><p><b>{turn.company} agent</b><small>Round {turn.round} · {turn.type}</small></p><span className="validated"><Check size={12} /> Validated</span></div>
                  <p>{turn.reasoning}</p>
                  <div className="term-chips">
                    <span>${Number(turn.terms.annualPrice).toLocaleString()}</span>
                    <span>{String(turn.terms.contractMonths)} months</span>
                    <span>Net {String(turn.terms.paymentDays)}</span>
                    <span>{String(turn.terms.supportHours)} support hrs</span>
                  </div>
                  <button>View authority check <ChevronDown size={13} /></button>
                </article>
              ))}
            </div>
          )}
        </div>
        <aside className="agreement-panel">
          <div className="panel-title"><span>Agreement state</span></div>
          {!result?.converged ? (
            <div className="agreement-wait"><span>{running ? "03" : "00"}</span><p>Rounds completed</p><small>No terms become binding without two approvals.</small></div>
          ) : (
            <>
              <div className="success-seal"><Check size={22} /></div>
              <h2>Common ground found</h2>
              <p className="muted">Every final term satisfies both private constraint profiles.</p>
              <dl className="final-terms">
                <div><dt>Annual price</dt><dd>${Number(result.finalTerms?.annualPrice).toLocaleString()}</dd></div>
                <div><dt>Contract term</dt><dd>{String(result.finalTerms?.contractMonths)} months</dd></div>
                <div><dt>Payment</dt><dd>Net {String(result.finalTerms?.paymentDays)}</dd></div>
                <div><dt>Renewal</dt><dd>Explicit approval</dd></div>
              </dl>
              <div className="approval-stack">
                <button onClick={() => setApprovals(Math.max(approvals, 1))} className={approvals >= 1 ? "approved" : ""}><span>Northstar approval</span>{approvals >= 1 ? <Check size={15} /> : "Approve"}</button>
                <button onClick={() => setApprovals(2)} disabled={approvals < 1} className={approvals >= 2 ? "approved" : ""}><span>Helio approval</span>{approvals >= 2 ? <Check size={15} /> : "Approve"}</button>
              </div>
              <button className="button proof-button" disabled={approvals < 2 || !!proof} onClick={anchor}><Fingerprint size={16} />{proof ? "Proof created" : "Anchor proof on devnet"}</button>
              {proof && <div className="proof-card"><b>{proof.mode === "devnet" ? "Solana devnet proof" : "Devnet-ready proof"}</b><code>{proof.signature ?? proof.hash}</code>{proof.signature && <a target="_blank" href={`https://explorer.solana.com/tx/${proof.signature}?cluster=devnet`}>Open Explorer <ExternalLink size={12} /></a>}</div>}
            </>
          )}
        </aside>
      </section>
    </main>
  );
}
