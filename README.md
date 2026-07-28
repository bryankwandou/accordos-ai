# AccordOS

Autonomous agent-to-agent B2B negotiation with deterministic authority rails, dual human approval, and optional Solana devnet proof anchoring.

## Run locally

```bash
npm install
npm test
npm run dev
```

Open `http://localhost:3000` and use **Run a live negotiation**.

## Environment

Copy `.env.example` to `.env.local`. The app works without secrets in deterministic demo mode.

- `GROQ_API_KEY` adds a live Groq-generated strategic explanation.
- `SOLANA_PRIVATE_KEY` accepts a JSON secret-key byte array for a funded devnet signer.
- `SOLANA_RPC_URL` defaults to Solana devnet.

No wallet secret is exposed to the browser. Without a signer, the proof endpoint returns the exact digest that is ready to anchor.

## Validation

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

See `docs/DECISIONS.md`, `docs/SECURITY.md`, and `docs/PITCH.md` for architecture, boundaries, and submission material.
