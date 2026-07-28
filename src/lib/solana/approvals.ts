import bs58 from "bs58";
import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";
import { hashAgreement } from "./proof.ts";

export interface WalletApproval {
  role: "buyer" | "vendor";
  publicKey: string;
  signature: string;
}

export function approvalMessage(terms: Record<string, string | number | boolean>, role: "buyer" | "vendor") {
  const agreementHash = hashAgreement({ terms, version: 1 });
  return `AccordOS approval\nRole: ${role}\nAgreement: ${agreementHash}\nNetwork: solana-devnet`;
}

export function verifyWalletApproval(terms: Record<string, string | number | boolean>, approval: WalletApproval) {
  try {
    const message = new TextEncoder().encode(approvalMessage(terms, approval.role));
    const publicKey = new PublicKey(approval.publicKey).toBytes();
    const signature = bs58.decode(approval.signature);
    return nacl.sign.detached.verify(message, signature, publicKey);
  } catch {
    return false;
  }
}

export function verifyDualApprovals(terms: Record<string, string | number | boolean>, approvals: WalletApproval[]) {
  const buyer = approvals.find((approval) => approval.role === "buyer");
  const vendor = approvals.find((approval) => approval.role === "vendor");
  if (!buyer || !vendor) return { valid: false, reason: "Buyer and vendor signatures are both required" };
  if (buyer.publicKey === vendor.publicKey) return { valid: false, reason: "Buyer and vendor must use different wallets" };
  if (!verifyWalletApproval(terms, buyer) || !verifyWalletApproval(terms, vendor)) return { valid: false, reason: "One or more wallet signatures are invalid" };
  return { valid: true, agreementHash: hashAgreement({ terms, approvals: approvals.map(({ role, publicKey }) => ({ role, publicKey })), version: 1 }) };
}
