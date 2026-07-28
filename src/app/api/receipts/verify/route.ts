import { NextResponse } from "next/server";
import { z } from "zod";
import { validateReceiptLocally } from "@/lib/solana/receipt";
import { verifyAgreementProof } from "@/lib/solana/proof";

const approval = z.object({ role: z.enum(["buyer", "vendor"]), publicKey: z.string(), signature: z.string() });
const schema = z.object({ product: z.literal("AccordOS"), network: z.literal("solana-devnet"), version: z.literal(2), negotiationId: z.string().uuid(), terms: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])), approvals: z.array(approval).length(2), agreementHash: z.string().regex(/^[a-f0-9]{64}$/), transactionSignature: z.string().min(64), createdAt: z.string() });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ verified: false, reason: "Malformed AccordOS receipt" }, { status: 400 });
  const local = validateReceiptLocally(parsed.data);
  if (!local.valid) return NextResponse.json({ verified: false, layer: "signatures", reason: local.reason }, { status: 403 });
  const chain = await verifyAgreementProof(parsed.data.transactionSignature, parsed.data.agreementHash);
  return NextResponse.json({ verified: chain.verified, signaturesValid: true, onChainValid: chain.verified, slot: chain.slot, blockTime: chain.blockTime, reason: chain.reason });
}
