import type {
  ConstraintProfile,
  ConstraintViolation,
  TermValue,
} from "./types.ts";

const describe = (value: TermValue) =>
  typeof value === "string" ? `“${value}”` : String(value);

export function validateOfferAgainstConstraints(
  proposedTerms: Record<string, TermValue>,
  constraints: ConstraintProfile,
): { isValid: boolean; violations: ConstraintViolation[] } {
  const violations: ConstraintViolation[] = [];

  for (const [key, constraint] of Object.entries(constraints.parameters)) {
    const value = proposedTerms[key];

    if (value === undefined) {
      violations.push({
        parameterKey: key,
        reason: `required parameter ${key} is missing`,
      });
      continue;
    }

    if (
      (constraint.floor !== undefined || constraint.ceiling !== undefined) &&
      (typeof value !== "number" || !Number.isFinite(value))
    ) {
      violations.push({
        parameterKey: key,
        reason: `${key} must be a finite number`,
      });
      continue;
    }

    if (constraint.floor !== undefined && Number(value) < constraint.floor) {
      violations.push({
        parameterKey: key,
        reason: `proposed value ${value} is below floor of ${constraint.floor}`,
      });
    }

    if (constraint.ceiling !== undefined && Number(value) > constraint.ceiling) {
      violations.push({
        parameterKey: key,
        reason: `proposed value ${value} exceeds ceiling of ${constraint.ceiling}`,
      });
    }

    if (constraint.mustEqual !== undefined && value !== constraint.mustEqual) {
      violations.push({
        parameterKey: key,
        reason: `proposed value ${describe(value)} must equal ${describe(constraint.mustEqual)}`,
      });
    }
  }

  for (const term of constraints.nonNegotiableTerms) {
    if (
      term.isHardRequirement &&
      proposedTerms[term.key] !== term.expectedValue
    ) {
      violations.push({
        parameterKey: term.key,
        reason: `violates required term: ${term.term}`,
      });
    }
  }

  return { isValid: violations.length === 0, violations };
}
