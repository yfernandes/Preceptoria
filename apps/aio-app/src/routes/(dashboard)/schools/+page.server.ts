import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import * as schoolService from '$lib/server/db/services/schools';
import * as orgService from '$lib/server/db/services/organizations';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const schools = await schoolService.listSchools();
	const organizations = await orgService.listOrganizations();

	return {
		schools,
		organizations
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) return fail(401);

		const formData = await request.formData();
		const name = formData.get('name')?.toString();
		const organizationId = formData.get('organizationId')?.toString();

		if (!name) {
			return fail(400, { message: 'Name is required' });
		}

		try {
			await schoolService.createSchool({
				name,
				organizationId: organizationId || undefined
			});
			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to create school' });
		}
	},

	update: async ({ request, locals }) => {
		if (!locals.user) return fail(401);

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const name = formData.get('name')?.toString();

		if (!id || !name) {
			return fail(400, { message: 'ID and Name are required' });
		}

		try {
			await schoolService.updateSchool(id, name);
			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to update school' });
		}
	},

	delete: async ({ request, locals }) => {
		if (!locals.user) return fail(401);

		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { message: 'ID is required' });
		}

		try {
			await schoolService.deleteSchool(id);
			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to delete school' });
		}
	}
};
