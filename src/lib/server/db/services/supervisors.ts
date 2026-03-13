import { eq } from "drizzle-orm"
import { db } from "$lib/server/db"
import { supervisors } from "$lib/server/db/schema"

export async function createSupervisor(data: { userId: string; schoolId: string }) {
	const [result] = await db.insert(supervisors).values(data).returning()
	return result
}

export async function getSupervisorById(id: string) {
	const result = await db.query.supervisors.findFirst({
		where: eq(supervisors.id, id),
		with: {
			user: true,
			school: true,
		},
	})
	return result
}

export async function listSupervisors(schoolId?: string) {
	if (schoolId) {
		return await db.query.supervisors.findMany({
			where: eq(supervisors.schoolId, schoolId),
			with: {
				user: true,
			},
		})
	}
	return await db.query.supervisors.findMany({
		with: {
			user: true,
			school: true,
		},
	})
}

export async function deleteSupervisor(id: string) {
	const [result] = await db.delete(supervisors).where(eq(supervisors.id, id)).returning()
	return result
}
