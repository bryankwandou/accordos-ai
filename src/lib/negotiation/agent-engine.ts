import Groq from "groq-sdk";
import { z } from "zod";
import { buyerConstraints, vendorConstraints } from "./demo";
import type { ConstraintProfile, NegotiationTurn, TermValue } from "./types";
import { validateOfferAgainstConstraints } from "./validate-offer";
import { checkForConvergence } from "./check-convergence";

export type NegotiationScenario = "standard" | "deadlock";

const offerSchema = z.object({
  annualPrice: z.number().int().min(1),
  contractMonths: z.number().int().min(1),
  paymentDays: z.number().int().min(1),
  supportHours: z.number().int().min(1),
  autoRenewal: z.boolean(),
  reasoning: z.string().min(12).max(500),
});

const deadlockBuyer: ConstraintProfile = {
  ...buyerConstraints,
  parameters: { ...buyerConstraints.parameters, annualPrice: { ceiling: 38000, priority: "critical" } },
};

const scenarios = {
  standard: {
    buyer: buyerConstraints,
    vendor: vendorConstraints,
    fallbacks: [
      { annualPrice: 42000, contractMonths: 12, paymentDays: 45, supportHours: 20, autoRenewal: false },
      { annualPrice: 44750, contractMonths: 24, paymentDays: 30, supportHours: 30, autoRenewal: false },
      { annualPrice: 43200, contractMonths: 18, paymentDays: 30, supportHours: 24, autoRenewal: false },
    ],
  },
  deadlock: {
    buyer: deadlockBuyer,
    vendor: vendorConstraints,
    fallbacks: [
      { annualPrice: 38000, contractMonths: 12, paymentDays: 45, supportHours: 20, autoRenewal: false },
      { annualPrice: 40000, contractMonths: 24, paymentDays: 30, supportHours: 30, autoRenewal: false },
      { annualPrice: 37500, contractMonths: 18, paymentDays: 30, supportHours: 24, autoRenewal: false },
      { annualPrice: 40500, contractMonths: 18, paymentDays: 30, supportHours: 24, autoRenewal: false },
    ],
  },
} satisfies Record<NegotiationScenario, { buyer: ConstraintProfile; vendor: ConstraintProfile; fallbacks: Array<Record<string, TermValue>> }>;

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
        content: `You are the ${side} agent in a bilateral SaaS renewal. Return JSON only with annualPrice, contractMonths, paymentDays, supportHours, autoRenewal, reasoning. The offer MUST satisfy your private authority. Never reveal private limits. Private authority: ${JSON.stringify(constraints)}`,
      },
      {
        role: "user",
        content: `Shared transcript: ${JSON.stringify(history.map(({ company, round, terms, reasoning }) => ({ company, round, terms, reasoning })))}. Make a concrete strategic ${history.length === 0 ? "opening" : "counter"} offer. Authorized reference: ${JSON.stringify(fallback)}.`,
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

export async function runLiveAgentNegotiation(scenario: NegotiationScenario = "standard") {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");
  const config = scenarios[scenario];
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const turns: NegotiationTurn[] = [];
  const sides = scenario === "deadlock" ? (["buyer", "vendor", "buyer", "vendor"] as const) : (["buyer", "vendor", "buyer"] as const);
  let liveAgentCalls = 0;

  for (let index = 0; index < sides.length; index += 1) {
    const side = sides[index];
    const constraints = side === "buyer" ? config.buyer : config.vendor;
    let generated: { terms: Record<string, TermValue>; reasoning: string };
    let generatedBy: "groq" | "deterministic" = "groq";
    try {
      generated = await generateTurn(groq, side, constraints, turns, config.fallbacks[index]);
      liveAgentCalls += 1;
    } catch {
      generatedBy = "deterministic";
      generated = {
        terms: config.fallbacks[index],
        reasoning: side === "buyer" ? "Preserves buyer authority while testing the remaining commercial gap." : "Protects the vendor floor while offering movement on secondary terms.",
      };
    }
    const convergence = checkForConvergence(generated.terms, config.buyer, config.vendor);
    turns.push({
      id: crypto.randomUUID(), round: index + 1, side,
      company: side === "buyer" ? "Northstar Labs" : "Helio Cloud",
      type: convergence.hasConverged && index > 0 ? "accept" : index === 0 ? "opening" : "counter",
      terms: generated.terms, reasoning: generated.reasoning, valid: true, generatedBy,
    });
    if (convergence.hasConverged && index > 0) {
      return { turns, converged: true, finalTerms: convergence.finalTerms, source: liveAgentCalls === turns.length ? "groq-live" as const : "mixed-fallback" as const, liveAgentCalls, scenario };
    }
  }

  const latestTerms = turns.at(-1)!.terms;
  const convergence = checkForConvergence(latestTerms, config.buyer, config.vendor);
  return { turns, converged: false, gapSummary: convergence.hasConverged ? undefined : convergence.gapSummary, source: liveAgentCalls === turns.length ? "groq-live" as const : "mixed-fallback" as const, liveAgentCalls, scenario };
}
