import { App } from "@api";
import { treaty } from "@elysiajs/eden";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Configure eden to include credentials for cookie handling
export const treatise = treaty<App>(API_BASE_URL, {
	fetch: {
		credentials: "include",
	},
	headers: {
		"Content-Type": "application/json",
	},
});
