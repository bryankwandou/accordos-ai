import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyDualApprovals, verifyWalletApproval } from "@/lib/solana/approvals";

const approval = z.object({ role: z.enum(["buyer", "vendor"]), publicKey: z.string(), signature: z.string() });
const schema = z.object({
  terms: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  approval: approval.optional(),
  approvals: z.array(approval).optional(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ valid: false, reason: "Malformed approval payload" }, { status: 400 });
  if (parsed.data.approval) return NextResponse.json({ valid: verifyWalletApproval(parsed.data.terms, parsed.data.approval) });
  return NextResponse.json(verifyDualApprovals(parsed.data.terms, parsed.data.approvals ?? []));
}
