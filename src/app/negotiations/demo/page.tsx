import type { Metadata } from "next";
import { NegotiationLab } from "@/components/negotiation-lab";

export const metadata: Metadata = { title: "Live Negotiation Demo" };
export default function DemoPage() { return <NegotiationLab />; }
