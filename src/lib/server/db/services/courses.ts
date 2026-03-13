import { eq } from "drizzle-orm"
import { db } from "$lib/server/db"
import { courses } from "$lib/server/db/schema"

export async function createCourse(data: { name: string; schoolId: string }) {
	const [result] = await db.insert(courses).values(data).returning()
	return result
}

export async function getCourseById(id: string) {
	const [result] = await db.select().from(courses).where(eq(courses.id, id))
	return result
}

export async function listCourses(schoolId?: string) {
	if (schoolId) {
		return await db.select().from(courses).where(eq(courses.schoolId, schoolId))
	}
	return await db.select().from(courses)
}

export async function updateCourse(id: string, name: string) {
	const [result] = await db.update(courses).set({ name }).where(eq(courses.id, id)).returning()
	return result
}

export async function deleteCourse(id: string) {
	const [result] = await db.delete(courses).where(eq(courses.id, id)).returning()
	return result
}
