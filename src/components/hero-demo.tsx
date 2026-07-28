"use client";

import { motion } from "framer-motion";
import { Check, LockKeyhole, ShieldCheck } from "lucide-react";

const offers = [
  {
    side: "Northstar buyer agent",
    copy: "We can move to $43,200 annually on an 18-month term with 24 support hours.",
    meta: "Round 3 · Within buyer authority",
    className: "buyer",
  },
  {
    side: "Helio vendor agent",
    copy: "Accepted. Net 30 payment and renewal only by explicit approval.",
    meta: "Round 3 · Satisfies both constraint sets",
    className: "vendor",
  },
];

export function HeroDemo() {
  return (
    <motion.div
      className="hero-window"
      initial={{ opacity: 0, scale: 0.96, rotateX: 7 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      transition={{ duration: 0.9, delay: 0.18 }}
    >
      <div className="window-bar">
        <span className="window-dots"><i /><i /><i /></span>
        <span>Northstar × Helio · SaaS renewal</span>
        <span className="live-pill"><i /> Live</span>
      </div>
      <div className="agent-rail">
        <div><span className="avatar dark">N</span><p><b>Northstar Labs</b><small>Buyer agent</small></p></div>
        <div className="rail-status"><LockKeyhole size={14} /> Private limits never shared</div>
        <div><p className="align-right"><b>Helio Cloud</b><small>Vendor agent</small></p><span className="avatar lime">H</span></div>
      </div>
      <div className="transcript">
        {offers.map((offer, index) => (
          <motion.article
            className={`message ${offer.className}`}
            key={offer.side}
            initial={{ opacity: 0, x: index ? 25 : -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + index * 0.35 }}
          >
            <span>{offer.side}</span>
            <p>{offer.copy}</p>
            <small><ShieldCheck size={12} /> {offer.meta}</small>
          </motion.article>
        ))}
      </div>
      <motion.div
        className="converged-bar"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <span><Check size={16} /> Terms converged</span>
        <small>Waiting for two human approvals</small>
      </motion.div>
    </motion.div>
  );
}
