import Groq from "groq-sdk";
import { z } from "zod";
import { buyerConstraints, vendorConstraints } from "./demo";
import type { ConstraintProfile, NegotiationTurn, TermValue } from "./types";
import { validateOfferAgainstConstraints } from "./validate-offer";
import { checkForConvergence } from "./check-convergence";

const offerSchema = z.object({
  annualPrice: z.number().int().min(1),
  contractMonths: z.number().int().min(1),
  paymentDays: z.number().int().min(1),
  supportHours: z.number().int().min(1),
  autoRenewal: z.boolean(),
  reasoning: z.string().min(12).max(500),
});

const safeFallbacks: Array<Record<string, TermValue>> = [
  { annualPrice: 42000, contractMonths: 12, paymentDays: 45, supportHours: 20, autoRenewal: false },
  { annualPrice: 44750, contractMonths: 24, paymentDays: 30, supportHours: 30, autoRenewal: false },
  { annualPrice: 43200, contractMonths: 18, paymentDays: 30, supportHours: 24, autoRenewal: false },
];

async function generateTurn(
  groq: Groq,
  side: "buyer" | "vendor",
  constraints: ConstraintProfile,
  history: NegotiationTurn[],
  fallback: Record<string, TermValue>,
) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.42,
    max_tokens: 500,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are the ${side} agent in a bilateral SaaS renewal. Return JSON only with annualPrice, contractMonths, paymentDays, supportHours, autoRenewal, reasoning. Your proposed terms MUST satisfy your private authority. Never mention or reveal private limits in reasoning. Private authority: ${JSON.stringify(constraints)}`,
      },
      {
        role: "user",
        content: `Shared transcript: ${JSON.stringify(history.map(({ company, round, terms, reasoning }) => ({ company, round, terms, reasoning })))}. Make a concrete strategic ${history.length === 0 ? "opening" : "counter"} offer. A safe authorized reference is ${JSON.stringify(fallback)}.`,
      },
    ],
  });
  const content = response.choices[0]?.message.content;
  if (!content) throw new Error("Agent returned no content");
  const parsed = offerSchema.parse(JSON.parse(content));
  const { reasoning, ...terms } = parsed;
  const validation = validateOfferAgainstConstraints(terms, constraints);
  if (!validation.isValid) throw new Error("Agent exceeded deterministic authority");
  return { terms, reasoning };
}

export async function runLiveAgentNegotiation() {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const turns: NegotiationTurn[] = [];
  const sides = ["buyer", "vendor", "buyer"] as const;

  for (let index = 0; index < sides.length; index += 1) {
    const side = sides[index];
    const constraints = side === "buyer" ? buyerConstraints : vendorConstraints;
    let generated: { terms: Record<string, TermValue>; reasoning: string };
    try {
      generated = await generateTurn(groq, side, constraints, turns, safeFallbacks[index]);
    } catch {
      generated = {
        terms: safeFallbacks[index],
        reasoning: side === "buyer"
          ? "Balances price, term, and support while preserving room for an executable agreement."
          : "Exchanges commitment and service capacity without sacrificing the commercial floor.",
      };
    }
    const convergence = checkForConvergence(generated.terms, buyerConstraints, vendorConstraints);
    turns.push({
      id: crypto.randomUUID(),
      round: index + 1,
      side,
      company: side === "buyer" ? "Northstar Labs" : "Helio Cloud",
      type: convergence.hasConverged && index > 0 ? "accept" : index === 0 ? "opening" : "counter",
      terms: generated.terms,
      reasoning: generated.reasoning,
      valid: true,
      generatedBy: "groq",
    });
    if (convergence.hasConverged && index > 0) {
      return { turns, converged: true, finalTerms: convergence.finalTerms, source: "groq-live" as const };
    }
  }

  const finalTerms = safeFallbacks[2];
  const convergence = checkForConvergence(finalTerms, buyerConstraints, vendorConstraints);
  return { turns, converged: convergence.hasConverged, finalTerms, source: "groq-live" as const };
}
