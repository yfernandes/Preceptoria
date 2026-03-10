import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import * as hospitalService from '$lib/server/db/services/hospitals';
import * as orgService from '$lib/server/db/services/organizations';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	// For MVP, OrgAdmin or SysAdmin can manage hospitals
	// We'll refine permissions later with a proper hasPermission helper
	const hospitals = await hospitalService.listHospitals();
	const organizations = await orgService.listOrganizations();

	return {
		hospitals,
		organizations
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) return fail(401);

		const formData = await request.formData();
		const name = formData.get('name')?.toString();
		const address = formData.get('address')?.toString();
		const organizationId = formData.get('organizationId')?.toString();

		if (!name) {
			return fail(400, { message: 'Name is required' });
		}

		try {
			await hospitalService.createHospital({
				name,
				address,
				organizationId: organizationId || undefined
			});
			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to create hospital' });
		}
	},

	update: async ({ request, locals }) => {
		if (!locals.user) return fail(401);

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const name = formData.get('name')?.toString();
		const address = formData.get('address')?.toString();

		if (!id || !name) {
			return fail(400, { message: 'ID and Name are required' });
		}

		try {
			await hospitalService.updateHospital(id, { name, address });
			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to update hospital' });
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
			await hospitalService.deleteHospital(id);
			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to delete hospital' });
		}
	}
};
