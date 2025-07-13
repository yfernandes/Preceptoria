import { Elysia } from "elysia";
import { authMiddleware } from "../modules/auth/auth.middleware";
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
export { authMiddleware } from "../modules/auth/auth.middleware";
export { userContextMiddleware } from "./userContext";
