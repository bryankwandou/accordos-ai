import { createHash } from "node:crypto";
import { Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";

export const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
export const ACCORDOS_MEMO_PREFIX = "ACCORDOS:";

export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  return `{${Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => `${JSON.stringify(key)}:${canonicalize(item)}`).join(",")}}`;
}

export function hashAgreement(agreement: unknown) {
  return createHash("sha256").update(canonicalize(agreement)).digest("hex");
}

export async function createAgreementProofTransaction(agreement: unknown, walletAddress: string) {
  const connection = new Connection(process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com", "confirmed");
  const wallet = new PublicKey(walletAddress);
  const hash = hashAgreement(agreement);
  const transaction = new Transaction({
    feePayer: wallet,
    recentBlockhash: (await connection.getLatestBlockhash("confirmed")).blockhash,
  }).add(new TransactionInstruction({
    keys: [{ pubkey: wallet, isSigner: true, isWritable: false }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(`${ACCORDOS_MEMO_PREFIX}${hash}`, "utf8"),
  }));
  return { hash, transaction: transaction.serialize({ requireAllSignatures: false }).toString("base64") };
}

export async function verifyAgreementProof(signature: string, expectedHash: string) {
  const connection = new Connection(process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com", "confirmed");
  const transaction = await connection.getParsedTransaction(signature, { commitment: "confirmed", maxSupportedTransactionVersion: 0 });
  if (!transaction) return { verified: false, reason: "Transaction is not confirmed on devnet" };
  const expectedMemo = `${ACCORDOS_MEMO_PREFIX}${expectedHash}`;
  const found = transaction.transaction.message.instructions.some((instruction) => {
    if (!("parsed" in instruction)) return false;
    return JSON.stringify(instruction.parsed).includes(expectedMemo);
  });
  return {
    verified: found,
    reason: found ? undefined : "Transaction does not contain the expected AccordOS agreement hash",
    slot: transaction.slot,
    blockTime: transaction.blockTime,
  };
}
