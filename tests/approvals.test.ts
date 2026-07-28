import assert from "node:assert/strict";
import test from "node:test";
import bs58 from "bs58";
import nacl from "tweetnacl";
import { Keypair } from "@solana/web3.js";
import { approvalMessage, verifyDualApprovals, verifyWalletApproval } from "../src/lib/solana/approvals.ts";

const negotiationId = "11111111-1111-4111-8111-111111111111";
const terms = { annualPrice: 43200, contractMonths: 18, paymentDays: 30, supportHours: 24, autoRenewal: false };

function sign(role: "buyer" | "vendor", signer: Keypair) {
  const message = new TextEncoder().encode(approvalMessage({ negotiationId, terms }, role));
  return { role, publicKey: signer.publicKey.toBase58(), signature: bs58.encode(nacl.sign.detached(message, signer.secretKey)) };
}

test("verifies approval against role and exact terms", () => {
  const signer = Keypair.generate();
  const approval = sign("buyer", signer);
  assert.equal(verifyWalletApproval({ negotiationId, terms }, approval), true);
  assert.equal(verifyWalletApproval({ negotiationId, terms: { ...terms, annualPrice: 43201 } }, approval), false);
  assert.equal(verifyWalletApproval({ negotiationId, terms }, { ...approval, role: "vendor" }), false);
});

test("requires distinct buyer and vendor wallets", () => {
  const buyer = Keypair.generate();
  const vendor = Keypair.generate();
  assert.equal(verifyDualApprovals({ negotiationId, terms }, [sign("buyer", buyer), sign("vendor", vendor)]).valid, true);
  assert.equal(verifyDualApprovals({ negotiationId, terms }, [sign("buyer", buyer)]).valid, false);
  assert.equal(verifyDualApprovals({ negotiationId, terms }, [sign("buyer", buyer), sign("vendor", buyer)]).valid, false);
});

test("prevents replay across negotiation identities", () => {
  const signer = Keypair.generate();
  const approval = sign("buyer", signer);
  assert.equal(verifyWalletApproval({ negotiationId: "33333333-3333-4333-8333-333333333333", terms }, approval), false);
});


