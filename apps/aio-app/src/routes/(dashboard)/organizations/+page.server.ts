import { error, fail } from "@sveltejs/kit";
import * as orgService from "$lib/server/db/services/organizations";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, "Unauthorized");
	}

	const organizations = await orgService.listOrganizations();

	return {
		organizations,
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) return fail(401);

		const formData = await request.formData();
		const name = formData.get("name")?.toString();

		if (!name) {
			return fail(400, { message: "Name is required" });
		}

		try {
			await orgService.createOrganization(name);
			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { message: "Failed to create organization" });
		}
	},

	update: async ({ request, locals }) => {
		if (!locals.user) return fail(401);

		const formData = await request.formData();
		const id = formData.get("id")?.toString();
		const name = formData.get("name")?.toString();

		if (!id || !name) {
			return fail(400, { message: "ID and Name are required" });
		}

		try {
			await orgService.updateOrganization(id, name);
			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { message: "Failed to update organization" });
		}
	},

	delete: async ({ request, locals }) => {
		if (!locals.user) return fail(401);

		const formData = await request.formData();
		const id = formData.get("id")?.toString();

		if (!id) {
			return fail(400, { message: "ID is required" });
		}

		try {
			await orgService.deleteOrganization(id);
			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { message: "Failed to delete organization" });
		}
	},
};
