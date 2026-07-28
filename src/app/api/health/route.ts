import { NextResponse } from "next/server";
import { Connection } from "@solana/web3.js";

export async function GET() {
  let solana = false;
  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com", "confirmed");
    solana = (await connection.getVersion())["solana-core"].length > 0;
  } catch {}
  return NextResponse.json({ status: process.env.GROQ_API_KEY && solana ? "operational" : "degraded", groqConfigured: Boolean(process.env.GROQ_API_KEY), solanaDevnetReachable: solana, network: "devnet", checkedAt: new Date().toISOString() });
}
