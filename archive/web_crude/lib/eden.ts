import { treaty } from "@elysiajs/eden";
import { App } from "@api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type TreatyApp = ReturnType<typeof treaty<App>>;

// Configure eden to include credentials for cookie handling
export const treatise: TreatyApp = treaty<App>(API_BASE_URL, {
	fetch: {
		credentials: "include",
	},
	headers: {
		"Content-Type": "application/json",
	},
});

// void treatise.healthFile.get();
// void treatise.admin.get();
