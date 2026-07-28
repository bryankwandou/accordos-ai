# Architecture Decisions

## Deterministic authority before model output

AccordOS treats every model response as an untrusted candidate. A pure TypeScript validator checks required fields, finite numeric values, inclusive bounds, exact values, and hard qualitative terms. The same function applies to agent output and manual overrides. Convergence means the identical proposed terms pass both private profiles independently.

## Confidentiality boundary

Constraint profiles are encrypted with AES-256-GCM. The encryption key is derived from a master secret and the owning organization identifier, so authenticated decryption with another organization identifier fails. A production deployment must move the master key to managed KMS and enforce tenant isolation in authenticated database queries.

## Solana as proof, not storage

Commercial terms never belong on a public ledger. After both humans approve, AccordOS computes a SHA-256 digest and places only that digest in a Solana devnet memo transaction. The transaction proves that an exact record existed without publishing it.

## Provider degradation

The interactive demo remains usable without an AI key through a deterministic negotiation scenario. When `GROQ_API_KEY` is present, Groq produces the final strategic explanation. Authorization never depends on provider availability.
