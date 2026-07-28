import { NextResponse } from "next/server";
import { z } from "zod";
import { createAgreementProofTransaction } from "@/lib/solana/proof";

const schema = z.object({
  terms: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  approvals: z.literal(2),
  walletAddress: z.string().min(32).max(44),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Valid terms, two approvals, and a wallet are required" }, { status: 400 });
  try {
    return NextResponse.json(await createAgreementProofTransaction(parsed.data, parsed.data.walletAddress));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create proof transaction" }, { status: 502 });
  }
}
