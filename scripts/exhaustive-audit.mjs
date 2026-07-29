const base = process.env.BASE_URL ?? "https://accordos-ai.vercel.app";
const queue = ["/"];
const visited = new Map();
const broken = [];
const mojibake = /(?:\u00c3[\u0080-\u00bf]|\u00c2[\u0080-\u00bf]|\ufffd)/;

while (queue.length) {
  const path = queue.shift();
  if (!path || visited.has(path)) continue;
  const response = await fetch(new URL(path, base), { redirect: "follow" });
  const contentType = response.headers.get("content-type") ?? "";
  const body = await response.text();
  visited.set(path, response.status);
  if (response.status >= 400) broken.push(`${path} -> ${response.status}`);
  if (contentType.includes("text/html")) {
    if (mojibake.test(body)) broken.push(`${path} -> mojibake detected`);
    for (const match of body.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const target = match[1];
      if (!target || target.startsWith("#") || target.startsWith("mailto:") || target.startsWith("javascript:")) continue;
      const url = new URL(target, base);
      if (url.origin === new URL(base).origin && !visited.has(url.pathname + url.search)) queue.push(url.pathname + url.search);
    }
  }
}

const cases = [
  ["GET", "/api/health", undefined, 200],
  ["POST", "/api/negotiate", { scenario: "standard" }, 200],
  ["POST", "/api/negotiate", { scenario: "invalid" }, 400],
  ["POST", "/api/guardrails/challenge", { terms: { annualPrice: 99000, contractMonths: 36, paymentDays: 7, supportHours: 2, autoRenewal: true } }, 200],
  ["POST", "/api/proof/verify", {}, 400],
  ["POST", "/api/receipts/verify", {}, 400],
  ["POST", "/api/approvals/challenge", {}, 400],
  ["POST", "/api/approvals/verify", {}, 400],
];

for (const [method, path, payload, expected] of cases) {
  const response = await fetch(`${base}${path}`, { method, headers: payload ? { "content-type": "application/json" } : undefined, body: payload ? JSON.stringify(payload) : undefined });
  if (response.status !== expected) broken.push(`${method} ${path} -> ${response.status}, expected ${expected}`);
}

const missing = await fetch(`${base}/audit-intentional-missing-route`);
if (missing.status !== 404 || !(await missing.text()).includes("This route does not exist")) broken.push("Custom 404 contract failed");
if (broken.length) { console.error(broken.join("\n")); process.exit(1); }
console.log(JSON.stringify({ base, crawledInternalResources: visited.size, unexpected404s: 0, apiContractFailures: 0, mojibakePages: 0 }, null, 2));

