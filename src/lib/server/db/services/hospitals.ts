import { eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import { hospitals } from "$lib/server/db/schema";

export async function createHospital(data: {
	name: string;
	address?: string;
	organizationId?: string;
}) {
	const [result] = await db.insert(hospitals).values(data).returning();
	return result;
}

export async function getHospitalById(id: string) {
	const [result] = await db
		.select()
		.from(hospitals)
		.where(eq(hospitals.id, id));
	return result;
}

export async function listHospitals(organizationId?: string) {
	if (organizationId) {
		return await db
			.select()
			.from(hospitals)
			.where(eq(hospitals.organizationId, organizationId));
	}
	return await db.select().from(hospitals);
}

export async function updateHospital(
	id: string,
	data: Partial<{ name: string; address: string }>,
) {
	const [result] = await db
		.update(hospitals)
		.set(data)
		.where(eq(hospitals.id, id))
		.returning();
	return result;
}

export async function deleteHospital(id: string) {
	const [result] = await db
		.delete(hospitals)
		.where(eq(hospitals.id, id))
		.returning();
	return result;
}
