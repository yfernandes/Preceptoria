import { error, fail } from "@sveltejs/kit";
import { eq, and, gt, sql } from "drizzle-orm";
import { db } from "$lib/server/db";
import { 
	shifts, 
	studentShifts, 
	hospitals, 
	preceptors, 
	students, 
	user, 
	documents,
	preceptorAvailability,
	studentAvailability
} from "$lib/server/db/schema";
import { hasPermission, Resource, Actions } from "$lib/server/permissions";
import type { Actions as FormActions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw error(401);

	// List all shifts with preceptor and hospital info
	const allShifts = await db.query.shifts.findMany({
		with: {
			hospital: true,
			preceptor: { with: { user: true } },
			students: { with: { student: { with: { user: true } } } }
		},
		orderBy: (s, { asc }) => [asc(s.date), asc(s.startTime)]
	});

	// List all hospitals for the creation form
	const allHospitals = await db.query.hospitals.findMany();

	// List all preceptors
	const allPreceptors = await db.query.preceptors.findMany({
		with: { user: true }
	});

	// List all students with their document status
	const allStudents = await db.query.students.findMany({
		with: { 
			user: true,
			documents: true
		}
	});

	return {
		shifts: allShifts,
		hospitals: allHospitals,
		preceptors: allPreceptors,
		students: allStudents
	};
};

export const actions: FormActions = {
	create: async ({ request, locals }) => {
		if (!locals.user) return fail(401);
		
		const formData = await request.formData();
		const hospitalId = formData.get("hospitalId")?.toString();
		const preceptorId = formData.get("preceptorId")?.toString();
		const date = new Date(formData.get("date")?.toString() || "");
		const startTime = new Date(`${formData.get("date")}T${formData.get("startTime")}`);
		const endTime = new Date(`${formData.get("date")}T${formData.get("endTime")}`);
		const location = formData.get("location")?.toString();

		if (!hospitalId || !preceptorId || isNaN(date.getTime())) {
			return fail(400, { message: "Campos obrigatórios ausentes" });
		}

		try {
			await db.insert(shifts).values({
				hospitalId,
				preceptorId,
				date,
				startTime,
				endTime,
				location
			});
			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { message: "Erro ao criar plantão" });
		}
	},

	assign: async ({ request, locals }) => {
		if (!locals.user) return fail(401);

		const formData = await request.formData();
		const shiftId = formData.get("shiftId")?.toString();
		const studentId = formData.get("studentId")?.toString();

		if (!shiftId || !studentId) return fail(400);

		// Check document status
		const studentDocs = await db.query.documents.findMany({
			where: eq(documents.studentId, studentId)
		});

		const allApproved = studentDocs.length > 0 && studentDocs.every(d => d.status === 'APPROVED');

		if (!allApproved) {
			return fail(400, { message: "O estudante não possui todos os documentos aprovados." });
		}

		try {
			await db.insert(studentShifts).values({
				shiftId,
				studentId
			});
			return { success: true };
		} catch (err) {
			return fail(500, { message: "Erro ao atribuir estudante" });
		}
	},

	removeStudent: async ({ request, locals }) => {
		if (!locals.user) return fail(401);
		const formData = await request.formData();
		const shiftId = formData.get("shiftId")?.toString();
		const studentId = formData.get("studentId")?.toString();

		if (!shiftId || !studentId) return fail(400);

		await db.delete(studentShifts).where(
			and(
				eq(studentShifts.shiftId, shiftId),
				eq(studentShifts.studentId, studentId)
			)
		);
		return { success: true };
	}
};
