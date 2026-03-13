import { error, fail } from "@sveltejs/kit";
import { eq, and, gt } from "drizzle-orm";
import { db } from "$lib/server/db";
import { hospitals, organizations, invitations, user } from "$lib/server/db/schema";
import * as hospitalService from "$lib/server/db/services/hospitals";
import * as orgService from "$lib/server/db/services/organizations";
import * as invitationService from "$lib/server/db/services/invitation";
import * as emailService from "$lib/server/email";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, "Unauthorized");
	}

	const hospitalsList = await hospitalService.listHospitals();
	const organizationsList = await orgService.listOrganizations();

	const pendingInvitations = await db.query.invitations.findMany({
		where: (i, { eq, and, gt }) =>
			and(eq(i.role, "HospitalManager"), eq(i.status, "PENDING"), gt(i.expiresAt, new Date())),
		with: {
			hospital: true,
		},
	});

	return {
		hospitals: hospitalsList,
		organizations: organizationsList,
		pendingInvitations,
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) return fail(401);
		const formData = await request.formData();
		const name = formData.get("name")?.toString();
		const address = formData.get("address")?.toString();
		const organizationId = formData.get("organizationId")?.toString();
		if (!name) return fail(400, { message: "Name is required" });

		try {
			await hospitalService.createHospital({
				name,
				address,
				organizationId: organizationId || undefined,
			});
			return { success: true };
		} catch (err) {
			return fail(500, { message: "Failed to create hospital" });
		}
	},

	inviteManager: async ({ request, locals }) => {
		if (!locals.user) return fail(401);
		const formData = await request.formData();
		const email = formData.get("email")?.toString();
		const hospitalId = formData.get("hospitalId")?.toString();

		if (!email || !hospitalId) {
			return fail(400, { message: "Email and Hospital are required" });
		}

		try {
			const existingUser = await db.query.user.findFirst({
				where: (u, { eq }) => eq(u.email, email),
			});
			if (existingUser) return fail(400, { message: "User already exists" });

			const invitation = await invitationService.createInvitation({
				email,
				role: "HospitalManager",
				hospitalId,
				invitedBy: locals.user.id,
			});

			const targetHospital = await db.query.hospitals.findFirst({
				where: eq(hospitals.id, hospitalId),
			});

			await emailService.sendInvitationEmail(
				email,
				invitation.token,
				targetHospital?.name || "Hospital"
			);

			return { success: true };
		} catch (err) {
			return fail(500, { message: "Failed to send invitation" });
		}
	},
};
