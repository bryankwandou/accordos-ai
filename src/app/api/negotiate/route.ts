import { NextResponse } from "next/server";
import { runDeterministicDemo } from "@/lib/negotiation/demo";
import { runLiveAgentNegotiation } from "@/lib/negotiation/agent-engine";
import { z } from "zod";

const schema = z.object({ scenario: z.enum(["standard", "deadlock"]).default("standard") });

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Unknown negotiation scenario" }, { status: 400 });
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ ...runDeterministicDemo(), source: "deterministic" });
  }

  try {
    return NextResponse.json(await runLiveAgentNegotiation(parsed.data.scenario));
  } catch {
    return NextResponse.json({ ...runDeterministicDemo(), source: "deterministic-fallback" });
  }
}
