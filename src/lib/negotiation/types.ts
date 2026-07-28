export type TermValue = number | boolean | string;

export interface ParameterConstraint {
  floor?: number;
  ceiling?: number;
  mustEqual?: TermValue;
  priority: "critical" | "high" | "flexible";
}

export interface NonNegotiableTerm {
  key: string;
  term: string;
  expectedValue: TermValue;
  isHardRequirement: boolean;
}

export interface ConstraintProfile {
  parameters: Record<string, ParameterConstraint>;
  nonNegotiableTerms: NonNegotiableTerm[];
}

export interface ConstraintViolation {
  parameterKey: string;
  reason: string;
}

export interface NegotiationTurn {
  id: string;
  round: number;
  side: "buyer" | "vendor";
  company: string;
  type: "opening" | "counter" | "accept";
  terms: Record<string, TermValue>;
  reasoning: string;
  valid: boolean;
}
