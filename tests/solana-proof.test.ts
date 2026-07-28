import assert from "node:assert/strict";
import test from "node:test";
import { Keypair, Transaction } from "@solana/web3.js";
import { ACCORDOS_MEMO_PREFIX, createAgreementProofTransaction, hashAgreement } from "../src/lib/solana/proof.ts";

test("agreement hashing is deterministic and sensitive to terms", () => {
  const first = hashAgreement({ terms: { price: 43200 }, approvals: 2 });
  const second = hashAgreement({ terms: { price: 43200 }, approvals: 2 });
  const changed = hashAgreement({ terms: { price: 43201 }, approvals: 2 });
  assert.equal(first, second);
  assert.notEqual(first, changed);
  assert.match(first, /^[a-f0-9]{64}$/);
});

test("creates a wallet-signable devnet memo transaction", async () => {
  const wallet = Keypair.generate();
  const agreement = { terms: { price: 43200 }, approvals: 2, walletAddress: wallet.publicKey.toBase58() };
  const proof = await createAgreementProofTransaction(agreement, wallet.publicKey.toBase58());
  const transaction = Transaction.from(Buffer.from(proof.transaction, "base64"));
  assert.equal(transaction.feePayer?.toBase58(), wallet.publicKey.toBase58());
  assert.equal(transaction.instructions.length, 1);
  assert.equal(transaction.instructions[0]?.data.toString(), `${ACCORDOS_MEMO_PREFIX}${proof.hash}`);
  assert.equal(transaction.instructions[0]?.keys[0]?.isSigner, true);
});

test("proof content excludes the fee-paying wallet identity", () => {
  const agreement = { terms: { price: 43200 }, approvals: 2, version: 1 };
  assert.equal(hashAgreement(agreement), hashAgreement({ ...agreement }));
  assert.notEqual(hashAgreement(agreement), hashAgreement({ ...agreement, walletAddress: "must-not-be-hashed" }));
});
