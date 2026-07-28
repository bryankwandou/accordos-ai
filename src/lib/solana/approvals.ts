import bs58 from "bs58";
import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";
import { hashAgreement } from "./proof.ts";

export interface WalletApproval { role: "buyer" | "vendor"; publicKey: string; signature: string }
export interface ApprovalContext { negotiationId: string; terms: Record<string, string | number | boolean> }

export function approvalMessage(context: ApprovalContext, role: "buyer" | "vendor") {
  const agreementHash = hashAgreement({ negotiationId: context.negotiationId, terms: context.terms, version: 2 });
  return `AccordOS approval v2\nNegotiation: ${context.negotiationId}\nRole: ${role}\nAgreement: ${agreementHash}\nNetwork: solana-devnet`;
}

export function verifyWalletApproval(context: ApprovalContext, approval: WalletApproval) {
  try {
    return nacl.sign.detached.verify(new TextEncoder().encode(approvalMessage(context, approval.role)), bs58.decode(approval.signature), new PublicKey(approval.publicKey).toBytes());
  } catch { return false; }
}

export function verifyDualApprovals(context: ApprovalContext, approvals: WalletApproval[]) {
  const buyer = approvals.find((approval) => approval.role === "buyer");
  const vendor = approvals.find((approval) => approval.role === "vendor");
  if (!buyer || !vendor) return { valid: false, reason: "Buyer and vendor signatures are both required" };
  if (buyer.publicKey === vendor.publicKey) return { valid: false, reason: "Buyer and vendor must use different wallets" };
  if (!verifyWalletApproval(context, buyer) || !verifyWalletApproval(context, vendor)) return { valid: false, reason: "One or more wallet signatures are invalid" };
  return { valid: true, agreementHash: hashAgreement({ negotiationId: context.negotiationId, terms: context.terms, approvals: approvals.map(({ role, publicKey }) => ({ role, publicKey })), version: 2 }) };
}
