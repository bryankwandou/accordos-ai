"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html><body><main style={{fontFamily:"sans-serif",padding:"10vh 8vw"}}><h1>AccordOS could not render this page.</h1><p>No transaction was submitted. Reload the application and retry.</p><button onClick={reset}>Reload</button></main></body></html>;
}
