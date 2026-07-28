import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Blocks,
  Check,
  Fingerprint,
  Gauge,
  KeyRound,
  LockKeyhole,
  Route,
  Scale,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { Header } from "@/components/header";
import { HeroDemo } from "@/components/hero-demo";
import { Reveal } from "@/components/reveal";
import { Logo } from "@/components/logo";

const features = [
  [KeyRound, "Private by architecture", "Each agent sees its own company’s limits and the shared transcript—never the other side’s private numbers."],
  [ShieldCheck, "Hard authority rails", "Every offer passes deterministic TypeScript validation. Out-of-bounds terms are rejected before transmission."],
  [Route, "Strategy you can inspect", "Follow each offer, concession, and stated rationale in one shared, time-stamped negotiation record."],
  [UsersRound, "Two signatures required", "Agents can find agreement. Only authorized people on both sides can approve the final proposal."],
  [Scale, "Deadlocks explained", "When no overlap exists, AccordOS identifies the exact remaining gaps instead of manufacturing an agreement."],
  [Fingerprint, "Verifiable deal proof", "After dual approval, anchor a tamper-evident agreement hash to Solana devnet without exposing terms."],
];

export default function Home() {
  return (
    <main>
      <div className="hero-shell">
        <Header />
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><i /> AUTONOMOUS NEGOTIATION, HUMAN AUTHORITY</span>
            <h1>Two agents.<br />One real deal.<br /><em>You keep the final word.</em></h1>
            <p>Each company sets private limits. Their agents negotiate the commercial terms inside those boundaries. Nothing becomes final until both sides approve it.</p>
            <div className="hero-actions">
              <Link className="button" href="/negotiations/demo">Run a live negotiation <ArrowRight size={17} /></Link>
              <Link className="text-link" href="#how">See how authority works <ArrowRight size={15} /></Link>
            </div>
            <div className="hero-proof">
              <span><Check size={14} /> Deterministic guardrails</span>
              <span><Check size={14} /> Private constraints</span>
              <span><Check size={14} /> Solana proof</span>
            </div>
          </div>
          <HeroDemo />
        </section>
      </div>

      <section className="trust-strip">
        <p>Built for agreements where the details matter</p>
        <div><span>SAAS RENEWALS</span><span>SUPPLIER TERMS</span><span>SERVICE LEVELS</span><span>PROCUREMENT</span></div>
      </section>

      <section className="section feature-section">
        <Reveal><span className="eyebrow dark-eye">CONTROL WITHOUT THE BACK-AND-FORTH</span><h2>Autonomy with a hard edge.</h2><p className="section-lead">The model proposes. Code decides whether the proposal is authorized. People decide whether the deal is final.</p></Reveal>
        <div className="feature-grid">
          {features.map(([Icon, title, copy], index) => (
            <Reveal delay={index * 0.05} key={String(title)}><article className="feature-card"><span className="feature-icon"><Icon size={21} /></span><h3>{String(title)}</h3><p>{String(copy)}</p><span className="card-index">0{index + 1}</span></article></Reveal>
          ))}
        </div>
      </section>

      <section className="dark-section" id="how">
        <div className="section process-wrap">
          <Reveal><span className="eyebrow">A CLEAR OPERATING MODEL</span><h2>Set authority once.<br />Let the agents work.</h2></Reveal>
          <div className="process-grid">
            {[
              [LockKeyhole, "01", "Define private limits", "Set floors, ceilings, priorities, and terms that cannot move. Your counterparty never sees them."],
              [Blocks, "02", "Invite the other side", "Both organizations configure independently, then activate a shared negotiation room."],
              [Gauge, "03", "Agents negotiate", "Offers and counters run through the same deterministic validator before either side receives them."],
              [BadgeCheck, "04", "Review and approve", "When terms satisfy both profiles, authorized people review the full record and sign off."],
            ].map(([Icon, number, title, copy]) => (
              <article className="process-card" key={String(number)}><span className="process-number">{String(number)}</span><Icon size={23} /><h3>{String(title)}</h3><p>{String(copy)}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="section guardrail-section">
        <Reveal><div className="guardrail-copy"><span className="eyebrow dark-eye">THE TRUST LAYER</span><h2>A prompt is not a policy.</h2><p>Models can misunderstand instructions. AccordOS treats model output as an untrusted proposal and subjects it to code-level validation against the acting company’s authority.</p><ul><li><Check size={16} /> Inclusive numeric boundaries and exact term checks</li><li><Check size={16} /> Missing, malformed, and non-finite values fail closed</li><li><Check size={16} /> The identical validator checks manual overrides</li><li><Check size={16} /> Convergence requires both private profiles to pass</li></ul><Link className="text-link dark-link" href="/security">Read the security model <ArrowRight size={15} /></Link></div></Reveal>
        <Reveal delay={0.15}><div className="code-card"><div className="code-top"><span><i /><i /><i /></span><small>validate-offer.ts</small><b>PASS</b></div><pre><code><span className="purple">if</span> (value &gt; constraint.ceiling) {`{`}{"\n"}  <span className="purple">return</span> reject({`{`}{"\n"}    reason: <span className="green">&quot;outside authority&quot;</span>{"\n"}  {`}`});{"\n"}{`}`}{"\n\n"}<span className="comment">{"// The offer never reaches the other side."}</span></code></pre><div className="test-row"><ShieldCheck size={18} /><span><b>47 adversarial checks</b><small>Boundary, type, omission, and isolation cases</small></span></div></div></Reveal>
      </section>

      <section className="cta-section"><Reveal><span className="cta-mark"><i /><i /></span><h2>Move the deal forward.<br />Keep authority where it belongs.</h2><p>Run the working negotiation demo. No account or wallet required.</p><Link className="button light-button" href="/negotiations/demo">Open negotiation room <ArrowRight size={17} /></Link></Reveal></section>
      <footer><Logo /><p>Deterministic authority rails for agent-led commerce.</p><div><Link href="/security">Security</Link><Link href="/pricing">Pricing</Link><Link href="/dashboard">Analytics</Link></div><small>© 2026 AccordOS. Attorney review recommended before production contracting.</small></footer>
    </main>
  );
}
