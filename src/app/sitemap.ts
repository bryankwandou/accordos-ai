import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap { return ["", "/pricing", "/security", "/verify", "/negotiations/demo"].map(path => ({ url: `https://accordos-ai.vercel.app${path}`, lastModified: new Date(), changeFrequency: "weekly" as const })); }
