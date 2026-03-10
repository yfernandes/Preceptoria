import { db } from '$lib/server/db';
import { schools } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function createSchool(data: { name: string; organizationId?: string }) {
	const [result] = await db.insert(schools).values(data).returning();
	return result;
}

export async function getSchoolById(id: string) {
	const [result] = await db.select().from(schools).where(eq(schools.id, id));
	return result;
}

export async function listSchools(organizationId?: string) {
	if (organizationId) {
		return await db.select().from(schools).where(eq(schools.organizationId, organizationId));
	}
	return await db.select().from(schools);
}

export async function updateSchool(id: string, name: string) {
	const [result] = await db.update(schools).set({ name }).where(eq(schools.id, id)).returning();
	return result;
}

export async function deleteSchool(id: string) {
	const [result] = await db.delete(schools).where(eq(schools.id, id)).returning();
	return result;
}
