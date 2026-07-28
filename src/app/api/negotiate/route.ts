import { NextResponse } from "next/server";
import { runDeterministicDemo } from "@/lib/negotiation/demo";
import { runLiveAgentNegotiation } from "@/lib/negotiation/agent-engine";

export async function POST() {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ ...runDeterministicDemo(), source: "deterministic" });
  }

  try {
    return NextResponse.json(await runLiveAgentNegotiation());
  } catch {
    return NextResponse.json({ ...runDeterministicDemo(), source: "deterministic-fallback" });
  }
}
