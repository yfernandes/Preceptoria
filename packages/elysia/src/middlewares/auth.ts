import { Elysia } from "elysia";
import { JwtOptions } from "../jwt";
import { tCookie, TJwtPayload } from "../types/jwtCookie";
import { User } from "../entities";
import { LRUCache } from "lru-cache";
import { db } from "../db";
import { jwt } from "@elysiajs/jwt";

// Interface for database operations - makes it easier to mock
export interface IUserRepository {
	findOneById(id: string): Promise<any | null>; // Using any to accommodate MikroORM's Loaded type
}

export type CachedUserType = Pick<User, "id" | "roles"> & {
	sysAdminId?: string;
	orgAdminId?: string;
	supervisorId?: string;
	hospitalManagerId?: string;
	preceptorId?: string;
	studentId?: string;
};

// Extract user lookup logic for better testability
export async function findUserById(
	userId: string,
	userRepository: IUserRepository = {
		findOneById: async (id: string) => {
			return await db.user.findOne(
				{ id },
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
		}
	}
): Promise<CachedUserType | null> {
	const dbUser = await userRepository.findOneById(userId);
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

export const authMiddleware = new Elysia({ name: "AuthMiddleware" })
	.use(jwt(JwtOptions))
	.state(
		"users",
		new LRUCache<string, CachedUserType>({
			max: 500, // Store up to 500 users
			ttl: 1000 * 60 * 30, // Expire after 30 minutes
		})
	) // Maybe use LRU-cache to avoid memory leak
	.guard(tCookie)
	.resolve(async ({ status, cookie, jwt, store: { users } }) => {
		try {
			const token = (await jwt.verify(
				cookie.session.value.CookieValue
			)) as TJwtPayload;

			let user = users.get(token.id);
			if (!user) {
				const foundUser = await findUserById(token.id);
				if (!foundUser) {
					return status(401);
				}
				user = foundUser;
				users.set(user.id, user);
			}

			return { requester: user };
		} catch (err) {
			console.error(err);
			return status(401);
		}
	});
