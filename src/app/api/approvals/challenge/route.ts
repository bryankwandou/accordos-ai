import { NextResponse } from "next/server";
import { z } from "zod";
import { approvalMessage } from "@/lib/solana/approvals";

const schema = z.object({
  terms: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  role: z.enum(["buyer", "vendor"]),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Valid terms and approval role required" }, { status: 400 });
  return NextResponse.json({ message: approvalMessage(parsed.data.terms, parsed.data.role) });
}
