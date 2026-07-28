# AccordOS

Autonomous agent-to-agent B2B negotiation with deterministic authority rails, dual human approval, and optional Solana devnet proof anchoring.

## Run locally

```bash
npm install
npm test
npm run dev
```

Open `http://localhost:3000` and use **Run a live negotiation**.

The demo includes convergence, a mathematically impossible deadlock, an adversarial override challenge, two distinct wallet-signed approvals, proof signing, and public devnet verification at `/verify`.

## Environment

Copy `.env.example` to `.env.local`. The app works without secrets in deterministic demo mode.

- `GROQ_API_KEY` adds a live Groq-generated strategic explanation.
- `SOLANA_RPC_URL` defaults to Solana devnet.

The browser connects directly to Phantom or Solflare. AccordOS prepares an unsigned memo transaction; the connected wallet signs and submits it, then the verification endpoint reads the confirmed devnet transaction and matches the agreement hash. No wallet secret reaches the app.

## Validation

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

See `docs/DECISIONS.md`, `docs/SECURITY.md`, and `docs/PITCH.md` for architecture, boundaries, and submission material.

A real confirmed proof and its verification record are documented in `docs/DEVNET_PROOF.md`.
