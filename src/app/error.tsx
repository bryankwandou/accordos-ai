"use client";

import { useEffect } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { void error; }, [error]);
  return <main className="error-page"><div><TriangleAlert size={32} /><span>Runtime error</span><h1>The workflow stopped safely.</h1><p>No approval or transaction was submitted. Retry the current step.</p><button className="button" onClick={reset}><RefreshCw size={15} /> Retry</button></div></main>;
}
