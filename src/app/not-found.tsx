import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return <main className="error-page"><Logo /><div><SearchX size={32} /><span>404</span><h1>This route does not exist.</h1><p>The link may be outdated. Return to the product or open the working negotiation room.</p><div><Link className="button" href="/"><ArrowLeft size={15} /> Home</Link><Link className="outline-button button" href="/negotiations/demo">Open demo</Link></div></div></main>;
}
