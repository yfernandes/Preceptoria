import { Elysia } from "elysia";
import { JwtOptions } from "../jwt";
import {
	tCookie,
	TJwtPayload,
	AuthenticatedUser,
	CookieValue,
} from "../types/jwtCookie";
import { jwt } from "@elysiajs/jwt";

// Helper function to extract session token from cookie
function extractSessionToken(cookieValue: CookieValue): string | null {
	// For real HTTP requests (parsed cookie object)
	if (typeof cookieValue === "object" && cookieValue.CookieValue) {
		return cookieValue.CookieValue;
	}

	// For unit tests (raw string)
	if (typeof cookieValue === "string") {
		// If the value is a stringified object, parse it
		if (cookieValue.startsWith("{")) {
			try {
				const parsed = JSON.parse(cookieValue) as { CookieValue?: string };
				return parsed.CookieValue ?? null;
			} catch {
				return null;
			}
		}
		return cookieValue;
	}

	return null;
}

// Pure authentication middleware - only handles JWT verification
export const authMiddleware = new Elysia({ name: "AuthMiddleware" })
	.use(jwt(JwtOptions))
	.guard(tCookie)
	.derive(async ({ cookie, jwt }) => {
		try {
			const sessionToken = extractSessionToken(cookie.session.value);

			if (!sessionToken) {
				throw new Error("No session cookie found");
			}

			const token = (await jwt.verify(sessionToken)) as TJwtPayload;

			if (!token.id) {
				throw new Error("Invalid token");
			}

			return {
				authenticatedUser: {
					id: token.id,
					roles: token.roles,
				} as AuthenticatedUser,
			};
		} catch (err) {
			console.error("Auth middleware error:", err);
			throw new Error("Authentication failed");
		}
	})
	.onError(({ error, set }) => {
		if (
			error instanceof Error &&
			(error.message === "Authentication failed" ||
				error.message === "No session cookie found" ||
				error.message === "Invalid token")
		) {
			set.status = 401;
			return { message: "Authentication failed" };
		}
		// Return a default error response for other errors
		set.status = 500;
		return { message: "Internal server error" };
	})
	.as("scoped");
