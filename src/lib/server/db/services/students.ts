import { eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import { students, user } from "$lib/server/db/schema";

export async function createStudent(data: {
	userId: string;
	classId: string;
	registrationNumber?: string;
}) {
	const [result] = await db.insert(students).values(data).returning();
	return result;
}

export async function getStudentById(id: string) {
	const result = await db.query.students.findFirst({
		where: eq(students.id, id),
		with: {
			user: true,
		},
	});
	return result;
}

export async function listStudentsByClass(classId: string) {
	return await db.query.students.findMany({
		where: eq(students.classId, classId),
		with: {
			user: true,
		},
	});
}

export async function updateStudent(
	id: string,
	data: Partial<{ classId: string; registrationNumber: string }>
) {
	const [result] = await db.update(students).set(data).where(eq(students.id, id)).returning();
	return result;
}

export async function deleteStudent(id: string) {
	const [result] = await db.delete(students).where(eq(students.id, id)).returning();
	return result;
}
