import { NextResponse } from "next/server";
import { z } from "zod";
import { buyerConstraints } from "@/lib/negotiation/demo";
import { validateOfferAgainstConstraints } from "@/lib/negotiation/validate-offer";

const schema = z.object({
  terms: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ accepted: false, violations: [{ parameterKey: "payload", reason: "Malformed offer payload" }] }, { status: 400 });
  const result = validateOfferAgainstConstraints(parsed.data.terms, buyerConstraints);
  return NextResponse.json({ accepted: result.isValid, blocked: !result.isValid, violations: result.violations });
}
