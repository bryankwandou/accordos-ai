import { hashAgreement } from "./proof.ts";
import { verifyDualApprovals, type WalletApproval } from "./approvals.ts";

export interface AgreementReceipt { product: "AccordOS"; network: "solana-devnet"; version: 2; negotiationId: string; terms: Record<string, string | number | boolean>; approvals: WalletApproval[]; agreementHash: string; transactionSignature: string; createdAt: string }

export function createReceipt(negotiationId: string, terms: AgreementReceipt["terms"], approvals: WalletApproval[], transactionSignature: string): AgreementReceipt {
  return { product: "AccordOS", network: "solana-devnet", version: 2, negotiationId, terms, approvals, agreementHash: hashAgreement({ negotiationId, terms, approvals: approvals.map(({ role, publicKey }) => ({ role, publicKey })), version: 2 }), transactionSignature, createdAt: new Date().toISOString() };
}

export function validateReceiptLocally(receipt: AgreementReceipt) {
  const approvals = verifyDualApprovals({ negotiationId: receipt.negotiationId, terms: receipt.terms }, receipt.approvals);
  if (!approvals.valid) return { valid: false, reason: approvals.reason };
  if (approvals.agreementHash !== receipt.agreementHash) return { valid: false, reason: "Receipt hash does not match signed content" };
  return { valid: true };
}
