import { count, eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import { documents, hospitals, internshipPlacements, students } from "$lib/server/db/schema";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	// Simple dashboard stats
	const [docsCount] = await db.select({ value: count() }).from(documents);
	const [pendingDocsCount] = await db
		.select({ value: count() })
		.from(documents)
		.where(eq(documents.status, "PENDING"));
	const [studentsCount] = await db.select({ value: count() }).from(students);
	const [hospitalsCount] = await db.select({ value: count() }).from(hospitals);
	const [activePlacements] = await db
		.select({ value: count() })
		.from(internshipPlacements)
		.where(eq(internshipPlacements.status, "ACTIVE"));

	return {
		stats: {
			documents: docsCount.value,
			pendingDocuments: pendingDocsCount.value,
			students: studentsCount.value,
			hospitals: hospitalsCount.value,
			activePlacements: activePlacements.value,
		},
	};
};
