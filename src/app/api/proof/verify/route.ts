import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAgreementProof } from "@/lib/solana/proof";

const schema = z.object({ signature: z.string().min(64), hash: z.string().regex(/^[a-f0-9]{64}$/) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ verified: false, reason: "Invalid signature or agreement hash" }, { status: 400 });
  try {
    return NextResponse.json(await verifyAgreementProof(parsed.data.signature, parsed.data.hash));
  } catch (error) {
    return NextResponse.json({ verified: false, reason: error instanceof Error ? error.message : "Verification failed" }, { status: 502 });
  }
}
