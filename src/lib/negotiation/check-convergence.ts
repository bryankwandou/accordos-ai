import type { ConstraintProfile, TermValue } from "./types.ts";
import { validateOfferAgainstConstraints } from "./validate-offer.ts";

export function checkForConvergence(
  proposedTerms: Record<string, TermValue>,
  buyerConstraints: ConstraintProfile,
  vendorConstraints: ConstraintProfile,
) {
  const buyerResult = validateOfferAgainstConstraints(
    proposedTerms,
    buyerConstraints,
  );
  const vendorResult = validateOfferAgainstConstraints(
    proposedTerms,
    vendorConstraints,
  );
  const violations = [...buyerResult.violations, ...vendorResult.violations];

  if (violations.length === 0) {
    return { hasConverged: true as const, finalTerms: proposedTerms };
  }

  return {
    hasConverged: false as const,
    gapSummary: violations.map((violation) => violation.reason).join("; "),
  };
}
