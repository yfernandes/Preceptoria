import { error, fail } from "@sveltejs/kit";
import { eq, and, gt } from "drizzle-orm";
import { db } from "$lib/server/db";
import { internshipPlacements, hospitals, students, user, classes } from "$lib/server/db/schema";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw error(401);

	// List all active placements
	const placements = await db.query.internshipPlacements.findMany({
		with: {
			student: { with: { user: true, class: true } },
			hospital: true
		},
		where: eq(internshipPlacements.status, "ACTIVE")
	});

	const hospitalsList = await db.query.hospitals.findMany();
	
	// List students who don't have an active placement (optional filter)
	const studentsList = await db.query.students.findMany({
		with: { user: true, class: true }
	});

	return {
		placements,
		hospitals: hospitalsList,
		students: studentsList
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) return fail(401);
		const formData = await request.formData();
		const studentId = formData.get("studentId")?.toString();
		const hospitalId = formData.get("hospitalId")?.toString();
		const startDate = new Date(formData.get("startDate")?.toString() || "");
		const endDate = new Date(formData.get("endDate")?.toString() || "");

		if (!studentId || !hospitalId || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
			return fail(400, { message: "Campos obrigatórios ausentes" });
		}

		try {
			await db.insert(internshipPlacements).values({
				studentId,
				hospitalId,
				startDate,
				endDate,
				status: "ACTIVE"
			});
			return { success: true };
		} catch (err) {
			return fail(500, { message: "Erro ao criar vínculo" });
		}
	},

	terminate: async ({ request, locals }) => {
		if (!locals.user) return fail(401);
		const formData = await request.formData();
		const id = formData.get("id")?.toString();
		if (!id) return fail(400);

		await db.update(internshipPlacements)
			.set({ status: "COMPLETED" })
			.where(eq(internshipPlacements.id, id));
		
		return { success: true };
	}
};
