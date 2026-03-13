import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async ({ locals }) => {
	// Temporarily bypass redirect for UI development
	/*
	if (!locals.user) {
		throw redirect(302, "/demo/better-auth/login");
	}
	*/

	return {
		user: locals.user || { name: "Gemini Preview", role: "ADMIN" },
	}
}
