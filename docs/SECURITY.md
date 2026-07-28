# Security Model

- Model output has no direct write authority.
- Validation fails closed on missing, malformed, non-finite, out-of-bound, and mismatched values.
- Constraints are authenticated-encrypted with organization-bound keys.
- Both organizations approve identical final terms before proof creation.
- Solana receives only a cryptographic digest, never private terms.
- API inputs are schema-validated before use.

This repository is a working product demonstration, not a completed compliance program. Production rollout requires managed identity, PostgreSQL tenant isolation, KMS-backed key rotation, audit retention, rate limiting, monitoring, incident response, penetration testing, and legal review.
