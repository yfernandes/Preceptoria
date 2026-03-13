import { fail, redirect } from "@sveltejs/kit";
import { auth } from "$lib/server/auth";
import type { Actions } from "./$types";

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		if (!email || !password) {
			return fail(400, { message: "Email and password are required" });
		}

		try {
			// Using the standard signIn with credentials providerId
			// The API for credentials login is often exposed this way:
			const result = await (auth.api as any).signInWithCredentials({
				body: {
					email,
					password,
					provider: "mock",
				},
				headers: event.request.headers,
			});

			if (result) {
				throw redirect(302, "/dashboard");
			}
		} catch (e) {
			if ((e instanceof Error && e.message === "302") || (e as any).status === 302) throw e; // Handle redirect

			// Better auth might throw for invalid credentials
			return fail(401, {
				message: "Credenciais inválidas ou ambiente não permitido.",
			});
		}
	},
};
