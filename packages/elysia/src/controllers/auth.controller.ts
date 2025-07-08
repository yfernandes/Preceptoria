import Elysia, { status, t } from "elysia";
import { User } from "../entities/user.entity";
import { UserRoles } from "../entities/role.abstract";

import { JwtOptions } from "../jwt";
import { tCookie, TJwtPayload } from "../types/jwtCookie";
import { db } from "../db";
import { ValidationError } from "class-validator";
import jwt from "../../lib/jwt";

const signUpDto = {
	body: t.Object({
		name: t.String(),
		email: t.String({ format: "email" }),
		phone: t.String(),
		password: t.String({ minLength: 6 }),
	}),
};

const signInDto = {
	body: t.Object({
		email: t.String({ format: "email" }),
		password: t.String(),
	}),
};

export const jwtInstance = jwt({
	...JwtOptions,
	// name: "jwt",
	// exp: "15m",
});

const authController = new Elysia({ prefix: "/auth" })
	.use(jwtInstance)
	.post(
		"/signup",
		async ({
			jwt,
			set,
			cookie: { session: auth, refresh: refreshCookie },
			body: { name, email, phone, password },
		}) => {
			try {
				// Check if user already exists
				const existing = await db.user.findOne({ email });
				if (existing) {
					return status(401, {
						success: false,
						message: "User already exists",
					});
				}

				// Create new user
				const user = await User.create(name, email, phone, password);

				// Assign default role (Student) to new users
				user.roles = [UserRoles.Student];

				// Ensure ID is assigned by flushing and reloading
				await db.em.persistAndFlush(user);

				// Generate JWT token
				const accessToken = await jwt.sign({
					id: user.id,
					roles: user.roles.toString(),
				});

				const refreshToken = await jwt.sign({
					id: user.id,
					roles: user.roles.toString(),
					exp: "7d",
				});

				auth.set({
					httpOnly: true,
					secure: true,
					sameSite: "strict",
					maxAge: 15 * 60,
					path: "/",
					value: accessToken,
				});

				refreshCookie.set({
					httpOnly: true,
					secure: true,
					sameSite: "strict",
					maxAge: 7 * 24 * 60 * 60,
					path: "/",
					value: refreshToken,
				});

				set.status = 201; // Created
				return {
					success: true,
					message: "User created successfully",
					user: {
						id: user.id,
						name: user.name,
						email: user.email,
						phone: user.phoneNumber,
						roles: user.roles,
						createdAt: user.createdAt.toISOString(),
						updatedAt: user.updatedAt.toISOString(),
					},
				};
			} catch (err) {
				// console.error("Error is:\n", err);
				if (
					Array.isArray(err) &&
					err.every((e) => e instanceof ValidationError)
				) {
					return status(400, {
						success: false,
						message: "Validation failed",
						errors: err.map((e) => ({
							field: e.property,
							constraints: e.constraints,
						})),
					});
				}

				// Handle known DB errors if needed
				// if (error instanceof SomeDbErrorType) {
				// 	return {
				// 		status: 500,
				// 		body: { success: false, message: "Database error" },
				// 	};
				// }

				// Fallback for unexpected errors
				return status(500, {
					success: false,
					message: "Internal Server Error",
				});
			}
		},
		{
			...signUpDto,
			cookie: t.Object({
				session: t.Optional(
					t.Object({
						id: t.String(),
						roles: t.String(),
					})
				),
				refresh: t.Optional(
					t.Object({
						id: t.String(),
						roles: t.String(),
					})
				),
			}),
		}
	)
	.post(
		"/signin",
		async ({
			jwt,
			cookie: { session: auth, refresh: refreshCookie },
			body: { email, password },
		}) => {
			try {
				const user = await db.user.findOne(
					{ email },
					{ populate: ["passwordHash"] }
				);
				// Check if user exists
				if (
					!user ||
					!(await Bun.password.verify(password, user.passwordHash))
				) {
					return status(401, {
						success: false,
						message: "User or password incorrect",
					});
				}

				// Generate JWT Token
				const accessToken = jwt.sign({
					id: user.id,
					roles: user.roles.toString(),
				});

				// Generate Refresh Token
				const refreshToken = jwt.sign({
					id: user.id,
					roles: user.roles.toString(),
					exp: "7d",
				});

				auth.set({
					httpOnly: true,
					secure: true,
					sameSite: "strict",
					maxAge: 15 * 60,
					path: "/",
					value: accessToken,
				});

				refreshCookie.set({
					httpOnly: true,
					secure: true,
					sameSite: "strict",
					maxAge: 7 * 24 * 60 * 60,
					path: "/",
					value: refreshToken,
				});

				return {
					success: true,
					message: "User logged in successfully",
					user: {
						id: user.id,
						name: user.name,
						email: user.email,
						phone: user.phoneNumber,
						roles: user.roles,
						createdAt: user.createdAt.toISOString(),
						updatedAt: user.updatedAt.toISOString(),
					},
				};
			} catch (err) {
				console.error("Signin error:", err);
				return status(500, {
					success: false,
					message: "Internal Server Error",
				});
			}
		},
		{
			...signInDto,
			cookie: t.Object({
				session: t.Optional(
					t.Object({
						id: t.String(),
						roles: t.String(),
					})
				),
				refresh: t.Optional(
					t.Object({
						id: t.String(),
						roles: t.String(),
					})
				),
			}),
		}
	)
	.post(
		"/logout",
		({ cookie: { session: auth, refresh: refreshCookie }, set }) => {
			auth.remove();
			refreshCookie.remove();
			set.status = 200;
			return { success: true, message: "Logged out successfully" };
		},
		tCookie
	)
	.post(
		"/refresh",
		async ({
			jwt,
			set,
			status,
			cookie: { refresh: refreshCookie, session: auth },
		}) => {
			// Extract refresh token
			const refreshToken = refreshCookie.value;
			try {
				// Verify refresh token
				const payload = (await jwt.verify(
					refreshToken.CookieValue
				)) as TJwtPayload;

				// Generate new access token
				const newAccessToken = jwt.sign({
					id: payload.id,
					roles: payload.roles,
				});

				// Set new access token in cookie
				auth.set({
					httpOnly: true,
					secure: true,
					sameSite: "strict",
					maxAge: 15 * 60, // 15 minutes
					path: "/",
					value: newAccessToken,
				});

				set.status = 200;
				return { success: true };
			} catch (curError) {
				// Invalid refresh token
				refreshCookie.remove(); // Clear the invalid refresh token

				console.error(curError);
				return status(401, `Invalid or Expired refresh token.`);
			}
		},
		tCookie
	);

export { authController };
