import type { ConstraintProfile, NegotiationTurn, TermValue } from "./types";
import { checkForConvergence } from "./check-convergence";
import { validateOfferAgainstConstraints } from "./validate-offer";

export const buyerConstraints: ConstraintProfile = {
  parameters: {
    annualPrice: { ceiling: 45000, priority: "critical" },
    contractMonths: { ceiling: 24, priority: "high" },
    paymentDays: { floor: 30, priority: "flexible" },
    supportHours: { floor: 20, priority: "high" },
  },
  nonNegotiableTerms: [
    {
      key: "autoRenewal",
      term: "renewal requires explicit approval",
      expectedValue: false,
      isHardRequirement: true,
    },
  ],
};

export const vendorConstraints: ConstraintProfile = {
  parameters: {
    annualPrice: { floor: 40000, priority: "critical" },
    contractMonths: { floor: 12, priority: "high" },
    paymentDays: { ceiling: 45, priority: "flexible" },
    supportHours: { ceiling: 30, priority: "high" },
  },
  nonNegotiableTerms: [
    {
      key: "autoRenewal",
      term: "renewal clause must be explicitly stated",
      expectedValue: false,
      isHardRequirement: true,
    },
  ],
};

const candidates: Array<Record<string, TermValue>> = [
  { annualPrice: 42000, contractMonths: 12, paymentDays: 45, supportHours: 20, autoRenewal: false },
  { annualPrice: 44750, contractMonths: 24, paymentDays: 30, supportHours: 30, autoRenewal: false },
  { annualPrice: 43200, contractMonths: 18, paymentDays: 30, supportHours: 24, autoRenewal: false },
];

export function runDeterministicDemo(): {
  turns: NegotiationTurn[];
  converged: boolean;
  finalTerms?: Record<string, TermValue>;
} {
  const turns: NegotiationTurn[] = candidates.map((terms, index) => {
    const side = index % 2 === 0 ? "buyer" : "vendor";
    const constraints = side === "buyer" ? buyerConstraints : vendorConstraints;
    const result = validateOfferAgainstConstraints(terms, constraints);
    return {
      id: `turn-${index + 1}`,
      round: index + 1,
      side,
      company: side === "buyer" ? "Northstar Labs" : "Helio Cloud",
      type: index === 0 ? "opening" : "counter",
      terms,
      reasoning:
        index === 0
          ? "Opens inside our authority while testing the vendor’s flexibility on term length."
          : index === 1
            ? "Trades a longer commitment for service depth without crossing the price floor."
            : "Splits the remaining distance across price, term, and support instead of forcing one concession.",
      valid: result.isValid,
    };
  });
  const finalTerms = candidates.at(-1)!;
  const convergence = checkForConvergence(
    finalTerms,
    buyerConstraints,
    vendorConstraints,
  );
  return {
    turns,
    converged: convergence.hasConverged,
    finalTerms: convergence.hasConverged ? convergence.finalTerms : undefined,
  };
}
