import type { Services } from "../db";
import { GSheets } from "tools";

export async function spreadsheetSync(db: Services) {
	const sheets = new GSheets();
	// ------------------- Submissions -------------------
	// Insert all submissions from google sheets
	const entries = await sheets.getSubmissions();

	// Add all submissions to DB to remove reliance from google sheets
	await db.submission.createAllIfNotFound(entries);
	await db.em.flush();

	const submissions = await db.submission.findAll();

	// Sync Submissions with Students
	for (const submission of submissions) {
		try {
			await db.student.checkExistingStudent(submission);
			await db.em.flush();
		} catch (error) {
			console.error(`Error processing submission ${submission.id}:`, error);
			// Handle the error as needed (e.g., rollback transaction, retry, etc.)
		}
	}
}
