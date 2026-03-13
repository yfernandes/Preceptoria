import { and, eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import { internshipPlacements } from "$lib/server/db/schema";

export async function createInternshipPlacement(data: {
	studentId: string;
	hospitalId: string;
	startDate: Date;
	endDate: Date;
}) {
	const [result] = await db.insert(internshipPlacements).values(data).returning();
	return result;
}

export async function getPlacementById(id: string) {
	return await db.query.internshipPlacements.findFirst({
		where: eq(internshipPlacements.id, id),
		with: {
			student: {
				with: {
					user: true,
				},
			},
			hospital: true,
		},
	});
}

export async function listPlacementsByHospital(hospitalId: string, activeOnly = true) {
	const conditions = [eq(internshipPlacements.hospitalId, hospitalId)];
	if (activeOnly) {
		conditions.push(eq(internshipPlacements.status, "ACTIVE"));
	}

	return await db.query.internshipPlacements.findMany({
		where: and(...conditions),
		with: {
			student: {
				with: {
					user: true,
				},
			},
		},
	});
}

export async function updatePlacementStatus(
	id: string,
	status: "ACTIVE" | "COMPLETED" | "CANCELLED"
) {
	const [result] = await db
		.update(internshipPlacements)
		.set({ status })
		.where(eq(internshipPlacements.id, id))
		.returning();
	return result;
}
