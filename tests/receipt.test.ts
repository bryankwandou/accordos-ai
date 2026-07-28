import assert from "node:assert/strict";
import test from "node:test";
import bs58 from "bs58";
import nacl from "tweetnacl";
import { Keypair } from "@solana/web3.js";
import { approvalMessage } from "../src/lib/solana/approvals.ts";
import { createReceipt, validateReceiptLocally } from "../src/lib/solana/receipt.ts";

const negotiationId = "22222222-2222-4222-8222-222222222222";
const terms = { annualPrice: 43200, contractMonths: 18, paymentDays: 30, supportHours: 24, autoRenewal: false };
function sign(role: "buyer" | "vendor", signer: Keypair) {
  return { role, publicKey: signer.publicKey.toBase58(), signature: bs58.encode(nacl.sign.detached(new TextEncoder().encode(approvalMessage({ negotiationId, terms }, role)), signer.secretKey)) };
}

test("creates a portable receipt with valid dual approvals", () => {
  const approvals = [sign("buyer", Keypair.generate()), sign("vendor", Keypair.generate())];
  const receipt = createReceipt(negotiationId, terms, approvals, "x".repeat(88));
  assert.equal(validateReceiptLocally(receipt).valid, true);
  assert.equal(receipt.network, "solana-devnet");
  assert.match(receipt.agreementHash, /^[a-f0-9]{64}$/);
});

test("detects modified receipt terms and hash", () => {
  const approvals = [sign("buyer", Keypair.generate()), sign("vendor", Keypair.generate())];
  const receipt = createReceipt(negotiationId, terms, approvals, "x".repeat(88));
  assert.equal(validateReceiptLocally({ ...receipt, terms: { ...terms, annualPrice: 1 } }).valid, false);
  assert.equal(validateReceiptLocally({ ...receipt, agreementHash: "0".repeat(64) }).valid, false);
});


