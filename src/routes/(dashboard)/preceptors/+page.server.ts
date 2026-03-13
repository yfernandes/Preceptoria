import { error, fail } from "@sveltejs/kit";
import { eq, and, gt } from "drizzle-orm";
import { db } from "$lib/server/db";
import { preceptors, hospitals, user, invitations } from "$lib/server/db/schema";
import * as invitationService from "$lib/server/db/services/invitation";
import * as emailService from "$lib/server/email";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw error(401);

	const allPreceptors = await db
		.select({
			id: preceptors.id,
			specialty: preceptors.specialty,
			licenseNumber: preceptors.licenseNumber,
			user: {
				name: user.name,
				email: user.email,
			},
			hospital: {
				name: hospitals.name,
			},
		})
		.from(preceptors)
		.innerJoin(user, eq(preceptors.userId, user.id))
		.innerJoin(hospitals, eq(preceptors.hospitalId, hospitals.id));

	const allHospitals = await db.select().from(hospitals);

	const pendingInvitations = await db.query.invitations.findMany({
		where: (i, { eq, and, gt }) =>
			and(eq(i.role, "Preceptor"), eq(i.status, "PENDING"), gt(i.expiresAt, new Date())),
		with: {
			hospital: true,
		},
	});

	return {
		preceptors: allPreceptors,
		hospitals: allHospitals,
		pendingInvitations,
	};
};

export const actions: Actions = {
	invite: async ({ request, locals }) => {
		if (!locals.user) return fail(401);

		const formData = await request.formData();
		const email = formData.get("email")?.toString();
		const hospitalId = formData.get("hospitalId")?.toString();

		if (!email || !hospitalId) {
			return fail(400, { message: "Email and Hospital are required" });
		}

		try {
			// Check if user already exists
			const existingUser = await db.query.user.findFirst({
				where: (u, { eq }) => eq(u.email, email),
			});
			if (existingUser) return fail(400, { message: "User already exists" });

			const invitation = await invitationService.createInvitation({
				email,
				role: "Preceptor",
				hospitalId,
				invitedBy: locals.user.id,
			});

			const targetHospital = await db.query.hospitals.findFirst({
				where: eq(hospitals.id, hospitalId),
			});

			// Note: I should probably update emailService to handle Preceptor invitations properly
			// but for now I'll use a generic one or sendInvitationEmail
			await emailService.sendInvitationEmail(
				email,
				invitation.token,
				targetHospital?.name || "Hospital"
			);

			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { message: "Failed to send invitation" });
		}
	},
};
