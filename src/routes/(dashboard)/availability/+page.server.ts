import { error, fail } from "@sveltejs/kit";
import { eq, and, gt } from "drizzle-orm";
import { db } from "$lib/server/db";
import { students, preceptors, studentAvailability, preceptorAvailability } from "$lib/server/db/schema";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw error(401);

	let studentProfile;
	let preceptorProfile;
	let availabilities: any[] = [];

	if (locals.user.role === "Student") {
		studentProfile = await db.query.students.findFirst({
			where: eq(students.userId, locals.user.id),
		});
		if (studentProfile) {
			availabilities = await db.query.studentAvailability.findMany({
				where: eq(studentAvailability.studentId, studentProfile.id),
				orderBy: (a, { asc }) => [asc(a.date)]
			});
		}
	} else if (locals.user.role === "Preceptor") {
		preceptorProfile = await db.query.preceptors.findFirst({
			where: eq(preceptors.userId, locals.user.id),
		});
		if (preceptorProfile) {
			availabilities = await db.query.preceptorAvailability.findMany({
				where: eq(preceptorAvailability.preceptorId, preceptorProfile.id),
				orderBy: (a, { asc }) => [asc(a.date)]
			});
		}
	}

	return {
		availabilities,
		role: locals.user.role
	};
};

export const actions: Actions = {
	submit: async ({ request, locals }) => {
		if (!locals.user) return fail(401);

		const formData = await request.formData();
		const date = new Date(formData.get("date")?.toString() || "");
		const startTime = new Date(`${formData.get("date")}T${formData.get("startTime")}`);
		const endTime = new Date(`${formData.get("date")}T${formData.get("endTime")}`);

		if (isNaN(date.getTime()) || isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
			return fail(400, { message: "Datas e horários inválidos" });
		}

		try {
			if (locals.user.role === "Student") {
				const profile = await db.query.students.findFirst({
					where: eq(students.userId, locals.user.id),
				});
				if (!profile) return fail(404, { message: "Perfil não encontrado" });

				await db.insert(studentAvailability).values({
					studentId: profile.id,
					date,
					startTime,
					endTime
				});
			} else if (locals.user.role === "Preceptor") {
				const profile = await db.query.preceptors.findFirst({
					where: eq(preceptors.userId, locals.user.id),
				});
				if (!profile) return fail(404, { message: "Perfil não encontrado" });

				await db.insert(preceptorAvailability).values({
					preceptorId: profile.id,
					date,
					startTime,
					endTime
				});
			}
			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { message: "Erro ao salvar disponibilidade" });
		}
	},

	delete: async ({ request, locals }) => {
		if (!locals.user) return fail(401);
		const formData = await request.formData();
		const id = formData.get("id")?.toString();
		if (!id) return fail(400);

		try {
			if (locals.user.role === "Student") {
				await db.delete(studentAvailability).where(eq(studentAvailability.id, id));
			} else if (locals.user.role === "Preceptor") {
				await db.delete(preceptorAvailability).where(eq(preceptorAvailability.id, id));
			}
			return { success: true };
		} catch (err) {
			return fail(500, { message: "Erro ao deletar" });
		}
	}
};
