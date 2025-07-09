import { App } from "@api";
import { treaty } from "@elysiajs/eden";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Patch: always send credentials: 'include' for cookies/session
export const treatise = treaty<App>(API_BASE_URL);
