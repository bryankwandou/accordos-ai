import { NextResponse } from "next/server";
import { z } from "zod";
import { anchorAgreementOnDevnet } from "@/lib/solana/proof";

const agreementSchema = z.object({
  terms: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  approvals: z.literal(2),
});

export async function POST(request: Request) {
  const parsed = agreementSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Two approvals and valid terms are required" }, { status: 400 });
  }
  try {
    return NextResponse.json(await anchorAgreementOnDevnet(parsed.data));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Devnet proof failed" },
      { status: 502 },
    );
  }
}
