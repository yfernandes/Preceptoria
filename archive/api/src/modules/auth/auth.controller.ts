import Elysia, { t } from "elysia";
import {
	handleSignUp,
	handleSignIn,
	handleTokenRefresh,
	setAuthCookies,
	AuthInput,
	SignInInput,
} from "./auth.service";

// Request DTOs
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

const authController = new Elysia({ prefix: "auth" })
	.post(
		"/signup",
		async ({
			set,
			cookie: { session: auth, refresh: refreshCookie },
			body,
		}) => {
			const result = await handleSignUp(body as AuthInput);

			if (result.success && result.accessToken && result.refreshToken) {
				setAuthCookies(
					auth,
					refreshCookie,
					result.accessToken,
					result.refreshToken
				);
				set.status = 201; // Created
			} else {
				set.status = result.message === "User already exists" ? 401 : 500;
			}

			return {
				success: result.success,
				message: result.message,
				...(result.user && { user: result.user }),
			};
		},
		{
			...signUpDto,
			cookie: t.Object({
				session: t.Optional(t.String()),
				refresh: t.Optional(t.String()),
			}),
		}
	)
	.post(
		"/signin",
		async ({
			set,
			cookie: { session: auth, refresh: refreshCookie },
			body,
		}) => {
			const result = await handleSignIn(body as SignInInput);

			if (result.success && result.accessToken && result.refreshToken) {
				setAuthCookies(
					auth,
					refreshCookie,
					result.accessToken,
					result.refreshToken
				);
			} else {
				set.status = 401;
			}

			return {
				success: result.success,
				message: result.message,
				...(result.user && { user: result.user }),
			};
		},
		{
			...signInDto,
			cookie: t.Object({
				session: t.Optional(t.String()),
				refresh: t.Optional(t.String()),
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
		{
			cookie: t.Object({
				session: t.Optional(t.String()),
				refresh: t.Optional(t.String()),
			}),
		}
	)
	.post(
		"/refresh",
		async ({ set, cookie: { refresh: refreshCookie, session: auth } }) => {
			const refreshToken = refreshCookie.value;
			if (!refreshToken) {
				refreshCookie.remove();
				set.status = 401;
				return { success: false, message: "No refresh token provided" };
			}
			const result = await handleTokenRefresh(refreshToken);

			if (result.success && result.accessToken && result.refreshToken) {
				setAuthCookies(
					auth,
					refreshCookie,
					result.accessToken,
					result.refreshToken
				);
				set.status = 200;
				return { success: true, message: result.message };
			} else {
				refreshCookie.remove();
				set.status = 401;
				return { success: false, message: result.message };
			}
		},
		{
			cookie: t.Object({
				session: t.Optional(t.String()),
				refresh: t.Optional(t.String()),
			}),
		}
	);

export { authController };
