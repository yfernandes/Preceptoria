import { Elysia } from "elysia";
import { authMiddleware } from "./auth";
import { userContextMiddleware } from "./userContext";

// Combined middleware that applies both authentication and user context
// This ensures proper dependency chain: auth -> user context
export const authenticatedUserMiddleware = new Elysia({
	name: "AuthenticatedUserMiddleware",
})
	.use(authMiddleware)
	.use(userContextMiddleware)
	.as("scoped");

// Export individual middlewares for cases where you only need authentication
export { authMiddleware } from "./auth";
export { userContextMiddleware } from "./userContext";
