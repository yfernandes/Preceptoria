import { error, fail } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";
import { db } from "$lib/server/db";
import { classes, supervisors, courses } from "$lib/server/db/schema";
import * as classService from "$lib/server/db/services/classes";
import * as billingService from "$lib/server/billing";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw error(401);

	let classesList;
	const allCourses = await db.query.courses.findMany({
		with: { school: true },
	});

	const allSupervisors = await db.query.supervisors.findMany({
		with: { user: true },
	});

	if (locals.user.role === "Supervisor") {
		const supervisor = await db.query.supervisors.findFirst({
			where: eq(supervisors.userId, locals.user.id),
		});
		if (!supervisor) throw error(404, "Supervisor profile not found");

		classesList = await db.query.classes.findMany({
			where: eq(classes.supervisorId, supervisor.id),
			with: {
				course: { with: { school: true } },
				supervisor: { with: { user: true } },
			},
		});
	} else {
		classesList = await db.query.classes.findMany({
			with: {
				course: { with: { school: true } },
				supervisor: { with: { user: true } },
			},
		});
	}

	return {
		classes: classesList,
		courses: allCourses,
		supervisors: allSupervisors,
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) return fail(401);

		// Only Admins or Supervisors (for themselves) can create
		const formData = await request.formData();
		const name = formData.get("name")?.toString();
		const courseId = formData.get("courseId")?.toString();
		const supervisorId = formData.get("supervisorId")?.toString();
		const startDate = new Date(formData.get("startDate")?.toString() || "");
		const endDate = new Date(formData.get("endDate")?.toString() || "");

		if (!name || !courseId || !startDate || !endDate) {
			return fail(400, { message: "Missing required fields" });
		}

		try {
			let finalSupervisorId = supervisorId;

			if (locals.user.role === "Supervisor") {
				const sup = await db.query.supervisors.findFirst({
					where: eq(supervisors.userId, locals.user.id),
				});
				finalSupervisorId = sup?.id;
			}

			await classService.createClass({
				name,
				courseId,
				supervisorId: finalSupervisorId || undefined,
				startDate,
				endDate,
			});
			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { message: "Failed to create class" });
		}
	},

	complete: async ({ request, locals }) => {
		if (!locals.user) return fail(401);

		const formData = await request.formData();
		const id = formData.get("id")?.toString();

		if (!id) return fail(400);

		try {
			// Permission check: only supervisor of this class or admin
			if (locals.user.role === "Supervisor") {
				const sup = await db.query.supervisors.findFirst({
					where: eq(supervisors.userId, locals.user.id),
				});
				const c = await db.query.classes.findFirst({
					where: and(eq(classes.id, id), eq(classes.supervisorId, sup?.id || "")),
				});
				if (!c) return fail(403, { message: "Unauthorized" });
			} else if (!["SysAdmin", "OrgAdmin"].includes(locals.user.role)) {
				return fail(403, { message: "Unauthorized" });
			}

			await billingService.completeClass(id);
			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { message: "Failed to complete class" });
		}
	},
};
