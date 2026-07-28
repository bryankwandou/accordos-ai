import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: { default: "AccordOS — Autonomous B2B negotiation", template: "%s · AccordOS" },
  description: "Two companies set private limits. Their agents negotiate within them. Humans approve the final terms.",
  metadataBase: new URL("https://accordos-ai.vercel.app"),
  openGraph: {
    title: "AccordOS — Two agents. One real deal.",
    description: "Deterministic authority rails for autonomous B2B negotiation.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${inter.variable} ${manrope.variable}`}>{children}</body></html>;
}
