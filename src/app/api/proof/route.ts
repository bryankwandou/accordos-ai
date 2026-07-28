import { NextResponse } from "next/server";
import { z } from "zod";
import { createAgreementProofTransaction } from "@/lib/solana/proof";
import { verifyDualApprovals } from "@/lib/solana/approvals";

const approvalSchema = z.object({ role: z.enum(["buyer", "vendor"]), publicKey: z.string(), signature: z.string() });

const schema = z.object({
  terms: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  negotiationId: z.string().uuid(),
  approvals: z.array(approvalSchema).length(2),
  walletAddress: z.string().min(32).max(44),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Valid terms, two signed approvals, and a wallet are required" }, { status: 400 });
  try {
    const approvalResult = verifyDualApprovals({ negotiationId: parsed.data.negotiationId, terms: parsed.data.terms }, parsed.data.approvals);
    if (!approvalResult.valid) return NextResponse.json({ error: approvalResult.reason }, { status: 403 });
    const agreement = { negotiationId: parsed.data.negotiationId, terms: parsed.data.terms, approvals: parsed.data.approvals.map(({ role, publicKey }) => ({ role, publicKey })), version: 2 };
    return NextResponse.json(await createAgreementProofTransaction(agreement, parsed.data.walletAddress));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create proof transaction" }, { status: 502 });
  }
}
