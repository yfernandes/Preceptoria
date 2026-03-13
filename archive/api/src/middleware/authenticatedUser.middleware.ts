import { Elysia } from "elysia"
import { userContextMiddleware } from "../middleware/userContext"
import { authMiddleware } from "../modules/auth/auth.middleware"

// Combined middleware that applies both authentication and user context
// This ensures proper dependency chain: auth -> user context
export const authenticatedUserMiddleware = new Elysia({
	name: "AuthenticatedUserMiddleware",
})
	.use(authMiddleware)
	.use(userContextMiddleware)
	.as("scoped")

export { userContextMiddleware } from "../middleware/userContext"
// Export individual middlewares for cases where you only need authentication
export { authMiddleware } from "../modules/auth/auth.middleware"
