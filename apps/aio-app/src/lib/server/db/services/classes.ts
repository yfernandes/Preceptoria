import { eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import { classes } from "$lib/server/db/schema";

export async function createClass(data: {
	name: string;
	courseId: string;
	startDate: Date;
	endDate: Date;
}) {
	const [result] = await db.insert(classes).values(data).returning();
	return result;
}

export async function getClassById(id: string) {
	const [result] = await db.select().from(classes).where(eq(classes.id, id));
	return result;
}

export async function listClasses(courseId?: string) {
	if (courseId) {
		return await db
			.select()
			.from(classes)
			.where(eq(classes.courseId, courseId));
	}
	return await db.select().from(classes);
}

export async function updateClass(
	id: string,
	data: Partial<{ name: string; startDate: Date; endDate: Date }>,
) {
	const [result] = await db
		.update(classes)
		.set(data)
		.where(eq(classes.id, id))
		.returning();
	return result;
}

export async function deleteClass(id: string) {
	const [result] = await db
		.delete(classes)
		.where(eq(classes.id, id))
		.returning();
	return result;
}
