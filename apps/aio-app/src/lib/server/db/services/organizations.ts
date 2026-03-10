import { db } from '$lib/server/db';
import { organizations } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function createOrganization(name: string) {
	const [result] = await db.insert(organizations).values({ name }).returning();
	return result;
}

export async function getOrganizationById(id: string) {
	const [result] = await db.select().from(organizations).where(eq(organizations.id, id));
	return result;
}

export async function listOrganizations() {
	return await db.select().from(organizations);
}

export async function updateOrganization(id: string, name: string) {
	const [result] = await db
		.update(organizations)
		.set({ name })
		.where(eq(organizations.id, id))
		.returning();
	return result;
}

export async function deleteOrganization(id: string) {
	const [result] = await db.delete(organizations).where(eq(organizations.id, id)).returning();
	return result;
}
