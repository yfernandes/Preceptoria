import { Elysia } from "elysia";
import { JwtOptions } from "../jwt";
import { tCookie, TJwtPayload } from "../types/jwtCookie";
import { User } from "../entities";
import { LRUCache } from "lru-cache";
import { db } from "../db";
import { jwt } from "../../lib/jwt";

export type CachedUserType = Pick<User, "id" | "roles"> & {
	sysAdminId?: string;
	orgAdminId?: string;
	supervisorId?: string;
	hospitalManagerId?: string;
	preceptorId?: string;
	studentId?: string;
};

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
	.resolve(async ({ error, cookie, jwt, store: { users } }) => {
		try {
			const token = (await jwt.verify(
				cookie.session.value.CookieValue
			)) as TJwtPayload;

			let user = users.get(token.id);
			if (!user) {
				const dbUser = await db.user.findOne(
					{ id: token.id },
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
					return error(401);
				}
				user = {
					id: dbUser.id,
					roles: dbUser.roles,
					sysAdminId: dbUser.sysAdmin?.id ?? undefined,
					orgAdminId: dbUser.orgAdmin?.id ?? undefined,
					supervisorId: dbUser.supervisor?.id ?? undefined,
					hospitalManagerId: dbUser.hospitalManager?.id ?? undefined,
					preceptorId: dbUser.preceptor?.id ?? undefined,
					studentId: dbUser.student?.id ?? undefined,
				};
				users.set(dbUser.id, user);
			}

			console.log(token);
			return { requester: user };
		} catch (err) {
			console.error(err);
			return error(401);
		}
	})
	.as("plugin");
