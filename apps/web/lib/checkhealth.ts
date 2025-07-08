import { treaty } from "@elysiajs/eden";
import type { App } from "@api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Create a basic treaty client for now
export const treatise = treaty<App>(API_BASE_URL);

console.log(await treatise.health.get());
