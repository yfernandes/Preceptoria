import { Elysia } from "elysia";
import { LRUCache } from "lru-cache";
import { db } from "../db";
import { UserContext } from "../types/jwtCookie";
import { authMiddleware } from "./auth";

// Extract user lookup logic for better testability
export async function findUserById(
	userId: string
): Promise<UserContext | null> {
	const dbUser = await db.user.findOne(
		{ id: userId },
		{
			populate: [
				"sysAdmin.id",
				"orgAdmin.id",
				"supervisor.id",
				"hospitalManager.id",
				"preceptor.id",
				"student.id",
			],
			fields: ["id", "roles"],
		}
	);
	if (!dbUser) {
		return null;
	}

	return {
		id: dbUser.id,
		roles: dbUser.roles,
		sysAdminId: dbUser.sysAdmin?.id ?? undefined,
		orgAdminId: dbUser.orgAdmin?.id ?? undefined,
		supervisorId: dbUser.supervisor?.id ?? undefined,
		hospitalManagerId: dbUser.hospitalManager?.id ?? undefined,
		preceptorId: dbUser.preceptor?.id ?? undefined,
		studentId: dbUser.student?.id ?? undefined,
	};
}

// User context middleware - handles user data injection and caching
export const userContextMiddleware = new Elysia({
	name: "UserContextMiddleware",
})
	.use(authMiddleware)
	.state(
		"users",
		new LRUCache<string, UserContext>({
			max: 500, // Store up to 500 users
			ttl: 1000 * 60 * 30, // Expire after 30 minutes
		})
	)
	.derive(async ({ store: { users }, authenticatedUser }) => {
		try {
			if (!authenticatedUser.id) {
				throw new Error("No authenticated user found");
			}

			let user = users.get(authenticatedUser.id);
			if (!user) {
				const foundUser = await findUserById(authenticatedUser.id);
				if (!foundUser) {
					throw new Error("User not found");
				}
				user = foundUser;
				users.set(user.id, user);
			}

			return { requester: user };
		} catch (err) {
			console.error("User context middleware error:", err);
			throw new Error("User context failed");
		}
	})
	.onError(({ error, set }) => {
		if (
			error instanceof Error &&
			(error.message === "User context failed" ||
				error.message === "No authenticated user found" ||
				error.message === "User not found")
		) {
			set.status = 401;
			return { message: "User context failed" };
		}
		// Return a default error response for other errors
		set.status = 500;
		return { message: "Internal server error" };
	})
	.as("scoped");
