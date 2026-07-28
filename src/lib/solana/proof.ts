import { createHash } from "node:crypto";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

export function hashAgreement(agreement: unknown) {
  return createHash("sha256").update(JSON.stringify(agreement)).digest("hex");
}

export async function anchorAgreementOnDevnet(agreement: unknown) {
  const secret = process.env.SOLANA_PRIVATE_KEY;
  if (!secret) {
    return { mode: "preview" as const, hash: hashAgreement(agreement) };
  }

  const signer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secret)));
  const connection = new Connection(
    process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
    "confirmed",
  );
  const memoProgram = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
  const hash = hashAgreement(agreement);
  const transaction = new Transaction().add(
    new TransactionInstruction({
      keys: [],
      programId: memoProgram,
      data: Buffer.from(`ACCORDOS:${hash}`, "utf8"),
    }),
  );
  const signature = await sendAndConfirmTransaction(connection, transaction, [signer]);
  return { mode: "devnet" as const, hash, signature };
}
