# Security Model

- Model output has no direct write authority.
- Validation fails closed on missing, malformed, non-finite, out-of-bound, and mismatched values.
- Constraints are authenticated-encrypted with organization-bound keys.
- Both organizations approve identical final terms before proof creation.
- Each organization signs a role-bound agreement challenge with a distinct Solana wallet; the server verifies both Ed25519 signatures before preparing proof.
- Solana receives only a cryptographic digest, never private terms.
- Phantom or Solflare signs the proof transaction client-side; wallet secrets never reach AccordOS.
- The verifier fetches the confirmed devnet transaction and matches its memo to the expected agreement hash.
- API inputs are schema-validated before use.

This repository is a working product demonstration, not a completed compliance program. Production rollout requires managed identity, PostgreSQL tenant isolation, KMS-backed key rotation, audit retention, rate limiting, monitoring, incident response, penetration testing, and legal review.
