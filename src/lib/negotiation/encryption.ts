import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { ConstraintProfile } from "./types.ts";

const keyForOrganization = (masterKey: string, organizationId: string) =>
  createHash("sha256").update(`${masterKey}:${organizationId}`).digest();

export function encryptConstraints(
  profile: ConstraintProfile,
  organizationId: string,
  masterKey: string,
) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(
    "aes-256-gcm",
    keyForOrganization(masterKey, organizationId),
    iv,
  );
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(profile), "utf8"),
    cipher.final(),
  ]);
  return [iv, cipher.getAuthTag(), encrypted]
    .map((part) => part.toString("base64url"))
    .join(".");
}

export function decryptConstraints(
  payload: string,
  organizationId: string,
  masterKey: string,
): ConstraintProfile {
  const [ivPart, authTagPart, encryptedPart] = payload.split(".");
  if (!ivPart || !authTagPart || !encryptedPart) {
    throw new Error("Malformed encrypted constraint payload");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    keyForOrganization(masterKey, organizationId),
    Buffer.from(ivPart, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(authTagPart, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedPart, "base64url")),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString("utf8")) as ConstraintProfile;
}
