import Link from "next/link";
import { Check } from "lucide-react";
import { Header } from "@/components/header";

const plans = [
  ["Pilot", "$0", "For teams validating their first agent-led negotiation.", ["3 active negotiations", "All system templates", "Dual approval", "Devnet proof"]],
  ["Team", "$249", "For procurement and revenue teams running recurring deals.", ["25 active negotiations", "Role-based access", "Email notifications", "Outcome analytics"]],
  ["Scale", "Custom", "For organizations that need dedicated controls and support.", ["Unlimited negotiations", "SSO and audit export", "Custom retention", "Security review"]],
];

export default function PricingPage() {
  return <main><div className="hero-shell compact-shell"><Header /><section className="page-hero"><span className="eyebrow">PRICING</span><h1>Pay for deals in motion,<br /><em>not messages sent.</em></h1><p>Start with the complete trust model. Scale when agent-led negotiation becomes part of your operating rhythm.</p></section></div><section className="section pricing-grid">{plans.map(([name, price, copy, features], index) => <article className={index === 1 ? "price-card featured" : "price-card"} key={String(name)}>{index === 1 && <span className="popular">MOST PRACTICAL</span>}<h2>{String(name)}</h2><p>{String(copy)}</p><div className="price">{String(price)}{String(price).startsWith("$") && String(price) !== "$0" && <small>/month</small>}</div><Link href="/negotiations/demo" className={index === 1 ? "button" : "button outline-button"}>Start with the demo</Link><ul>{(features as string[]).map(feature => <li key={feature}><Check size={15} />{feature}</li>)}</ul></article>)}</section></main>;
}
