import { eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import { hospitalManagers, user } from "$lib/server/db/schema";

export async function createHospitalManager(data: {
	userId: string;
	hospitalId: string;
}) {
	const [result] = await db.insert(hospitalManagers).values(data).returning();
	return result;
}

export async function getHospitalManagerById(id: string) {
	const result = await db.query.hospitalManagers.findFirst({
		where: eq(hospitalManagers.id, id),
		with: {
			user: true,
			hospital: true,
		},
	});
	return result;
}

export async function listHospitalManagers(hospitalId?: string) {
	if (hospitalId) {
		return await db.query.hospitalManagers.findMany({
			where: eq(hospitalManagers.hospitalId, hospitalId),
			with: {
				user: true,
			},
		});
	}
	return await db.query.hospitalManagers.findMany({
		with: {
			user: true,
			hospital: true,
		},
	});
}

export async function deleteHospitalManager(id: string) {
	const [result] = await db
		.delete(hospitalManagers)
		.where(eq(hospitalManagers.id, id))
		.returning();
	return result;
}
