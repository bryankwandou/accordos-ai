import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { runDeterministicDemo } from "@/lib/negotiation/demo";

export async function POST() {
  const demo = runDeterministicDemo();
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ ...demo, source: "deterministic" });
  }

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.35,
      max_tokens: 220,
      messages: [
        {
          role: "system",
          content: "You are a B2B negotiation strategist. Write one crisp sentence explaining why a balanced final SaaS offer is strategically sound. Never invent new numbers.",
        },
        {
          role: "user",
          content: "Final terms: $43,200 annual price, 18 months, Net 30, 24 support hours monthly, no automatic renewal.",
        },
      ],
    });
    const reasoning = completion.choices[0]?.message.content?.trim();
    if (reasoning && demo.turns.at(-1)) demo.turns.at(-1)!.reasoning = reasoning;
    return NextResponse.json({ ...demo, source: "groq" });
  } catch {
    return NextResponse.json({ ...demo, source: "deterministic" });
  }
}
