# Verified Solana Devnet Proof

AccordOS executed and independently re-read a real Solana devnet memo transaction during the MVP workflow audit.

- Network: Solana devnet
- Slot: `479488151`
- Agreement proof hash: `82dc196df69129f98f33bb46297569b3169f45c37c0fbee6a5b6419d5589703f`
- Transaction: `58Lk51jNa68RnMCgwVxMnZBE5FnwTVcyqGWebi9v4wFZKES8vMeR8ft2ssom5stkVFuMvEfpDiKHhrexSq3kM41G`
- Explorer: https://explorer.solana.com/tx/58Lk51jNa68RnMCgwVxMnZBE5FnwTVcyqGWebi9v4wFZKES8vMeR8ft2ssom5stkVFuMvEfpDiKHhrexSq3kM41G?cluster=devnet

Verification fetched the confirmed transaction from devnet and matched its memo to `ACCORDOS:<agreement-hash>`. No commercial terms or private constraints were written on-chain.

## Dual-approval receipt proof

The complete receipt workflow was subsequently executed with two distinct Ed25519 approvals bound to the exact agreement terms.

- Slot: `479541319`
- Agreement hash: `b2f11b4002eda9a41150304ca2953429d60b462dc9c030e8ab0ab5d24df1580d`
- Transaction: `3rYyV272QcMgJiQ6SUTxABzTppbwmWK3CRsZKtSY5noP8NJKeBcHuurs6Jc3RRq3dUpHd3wZPhabbkv8VvAQi6ML`
- Explorer: https://explorer.solana.com/tx/3rYyV272QcMgJiQ6SUTxABzTppbwmWK3CRsZKtSY5noP8NJKeBcHuurs6Jc3RRq3dUpHd3wZPhabbkv8VvAQi6ML?cluster=devnet

The machine-verifiable receipt is stored in `docs/LATEST_VERIFIED_RECEIPT.json` and can be uploaded directly to the public verifier.

## Receipt protocol v2

Protocol v2 adds canonical object hashing and binds both approvals to a unique negotiation identity, preventing a valid signature from being replayed for another negotiation with identical commercial terms.

- Negotiation ID: `7e027661-2409-47da-97ca-a594d5cb092d`
- Slot: `479548375`
- Agreement hash: `1e1321fa26215891c548254c30ab1d33ec6de6124b8c20b1f6ce453dd0eb5cf0`
- Transaction: `Kh6ck3wzaMeATq2q2ZaMEc7DqcBZ86qY7uHqctFtrLE59pVtvgeNQewikQ49iWf2AxpeKWXxEtFq2zwKMuamP35`
- Explorer: https://explorer.solana.com/tx/Kh6ck3wzaMeATq2q2ZaMEc7DqcBZ86qY7uHqctFtrLE59pVtvgeNQewikQ49iWf2AxpeKWXxEtFq2zwKMuamP35?cluster=devnet
