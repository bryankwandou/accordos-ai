import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "./logo";

export function Header() {
  return (
    <header className="site-header">
      <Logo />
      <nav aria-label="Main navigation">
        <Link href="/#how">How it works</Link>
        <Link href="/security">Security</Link>
        <Link href="/pricing">Pricing</Link>
      </nav>
      <Link className="button button-small" href="/negotiations/demo">
        Open demo <ArrowUpRight size={15} />
      </Link>
    </header>
  );
}
