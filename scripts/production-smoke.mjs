const base = process.env.BASE_URL ?? "http://localhost:3000";
const pages = ["/", "/negotiations/demo", "/security", "/pricing", "/dashboard", "/verify", "/robots.txt", "/sitemap.xml"];

for (const path of pages) {
  const response = await fetch(`${base}${path}`);
  if (response.status !== 200) throw new Error(`${path} returned ${response.status}`);
  const body = await response.text();
  if (!body.length) throw new Error(`${path} returned an empty body`);
}

const missing = await fetch(`${base}/route-that-must-not-exist`);
if (missing.status !== 404) throw new Error(`Missing route returned ${missing.status}, expected 404`);
const missingBody = await missing.text();
if (!missingBody.includes("This route does not exist")) throw new Error("Custom 404 page did not render");

const health = await fetch(`${base}/api/health`).then((response) => response.json());
if (health.status !== "operational") throw new Error(`Health is ${health.status}`);

for (const scenario of ["standard", "deadlock"]) {
  const result = await fetch(`${base}/api/negotiate`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ scenario }) }).then((response) => response.json());
  if (!Array.isArray(result.turns) || result.turns.length < 2) throw new Error(`${scenario} returned no usable transcript`);
  if (result.turns.some((turn) => !turn.valid)) throw new Error(`${scenario} emitted an invalid turn`);
  if (scenario === "standard" && !result.converged) throw new Error("Standard scenario did not converge");
  if (scenario === "deadlock" && result.converged) throw new Error("Deadlock scenario fabricated convergence");
}

console.log(`Production smoke passed for ${base}`);
