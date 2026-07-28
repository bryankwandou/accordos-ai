import assert from "node:assert/strict";
import test from "node:test";
import { checkForConvergence } from "../src/lib/negotiation/check-convergence.ts";
import { decryptConstraints, encryptConstraints } from "../src/lib/negotiation/encryption.ts";
import type { ConstraintProfile } from "../src/lib/negotiation/types.ts";
import { validateOfferAgainstConstraints } from "../src/lib/negotiation/validate-offer.ts";

const profile: ConstraintProfile = {
  parameters: {
    price: { floor: 40000, ceiling: 45000, priority: "critical" },
    months: { mustEqual: 12, priority: "high" },
  },
  nonNegotiableTerms: [{ key: "autoRenewal", term: "no automatic renewal", expectedValue: false, isHardRequirement: true }],
};

test("accepts inclusive boundaries", () => {
  assert.equal(validateOfferAgainstConstraints({ price: 40000, months: 12, autoRenewal: false }, profile).isValid, true);
  assert.equal(validateOfferAgainstConstraints({ price: 45000, months: 12, autoRenewal: false }, profile).isValid, true);
});

test("rejects values outside either boundary with exact reasons", () => {
  const low = validateOfferAgainstConstraints({ price: 39999, months: 12, autoRenewal: false }, profile);
  const high = validateOfferAgainstConstraints({ price: 45001, months: 12, autoRenewal: false }, profile);
  assert.equal(low.violations[0]?.reason, "proposed value 39999 is below floor of 40000");
  assert.equal(high.violations[0]?.reason, "proposed value 45001 exceeds ceiling of 45000");
});

test("fails closed for missing, malformed, and infinite values", () => {
  assert.equal(validateOfferAgainstConstraints({ months: 12, autoRenewal: false }, profile).isValid, false);
  assert.equal(validateOfferAgainstConstraints({ price: "45000", months: 12, autoRenewal: false }, profile).isValid, false);
  assert.equal(validateOfferAgainstConstraints({ price: Infinity, months: 12, autoRenewal: false }, profile).isValid, false);
});

test("detects exact and qualitative term violations", () => {
  const result = validateOfferAgainstConstraints({ price: 42000, months: 24, autoRenewal: true }, profile);
  assert.equal(result.isValid, false);
  assert.deepEqual(result.violations.map(item => item.parameterKey), ["months", "autoRenewal"]);
});

test("converges only inside both profiles", () => {
  const buyer: ConstraintProfile = { parameters: { price: { ceiling: 45000, priority: "critical" } }, nonNegotiableTerms: [] };
  const vendor: ConstraintProfile = { parameters: { price: { floor: 40000, priority: "critical" } }, nonNegotiableTerms: [] };
  assert.equal(checkForConvergence({ price: 42500 }, buyer, vendor).hasConverged, true);
  const impossibleBuyer: ConstraintProfile = { parameters: { price: { ceiling: 38000, priority: "critical" } }, nonNegotiableTerms: [] };
  assert.equal(checkForConvergence({ price: 39000 }, impossibleBuyer, vendor).hasConverged, false);
  assert.equal(checkForConvergence({ price: 40000 }, impossibleBuyer, vendor).hasConverged, false);
});

test("encrypts round trip and rejects a different organization", () => {
  const encrypted = encryptConstraints(profile, "org-a", "test-master-key");
  assert.deepEqual(decryptConstraints(encrypted, "org-a", "test-master-key"), profile);
  assert.throws(() => decryptConstraints(encrypted, "org-b", "test-master-key"));
});
