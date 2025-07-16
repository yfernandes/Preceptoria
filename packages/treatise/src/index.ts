// E2E Type Safety with Eden Treaty:
// This package uses a type-only import from the backend's exported App type (from 'api' alias),
// as recommended by the official eden/treaty installation guide:
// https://elysiajs.com/eden/installation.html
// The 'api' alias is configured in the root tsconfig.json to point to the backend's entry file.
// This ensures end-to-end type safety without pulling in backend runtime code or triggering unnecessary compilation.

import { treaty } from "@elysiajs/eden";
import type { App } from "@api/appType";

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

// void treatise.health.get();
// void treatise.admin.get();
