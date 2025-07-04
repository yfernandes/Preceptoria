import { initOrm } from "db";
import fs from "fs";
import path from "path";
import { PROJECT_ROOT } from "types";

function moveFile(oldPath: string, newPath: string): void {
	console.log(oldPath);
	console.log(newPath);

	fs.rename(oldPath, newPath, (err) => {
		if (err) {
			console.log(err);
		}
	});
}

async function MigrateStudent() {
	const db = await initOrm();
	const entries = [
		{
			studentName: "Bruna Da Costa Franco",
			incorrect: "329196-F",
			correct: "389195-F",
		},
		{
			studentName: "Amanda De Oliveira Santos Sales",
			incorrect: "211019-F",
			correct: "211029-F",
		},
	];

	for (const entry of entries) {
		const incorrect = await db.student.findOne(
			{ crefito: entry.incorrect },
			{ populate: ["insurance", "documentations"] }
		);

		const correct = await db.student.findOne(
			{ crefito: entry.correct },
			{ populate: ["insurance", "documentations"] }
		);

		if (correct && incorrect) {
			// If incorrect has insurance and correct doesn't, move the insurance
			if (incorrect.insurance && !correct.insurance) {
				const insurance = incorrect.insurance;

				insurance.student = correct;
				insurance.destPath = correct.studentFolder ? correct.studentFolder : "";
				correct.insurance = insurance;
				incorrect.insurance = undefined;
				db.em.persist(insurance);
				db.em.persist(correct);
				db.em.persist(incorrect);

				// Move insurance file on disk
				const oldPath = path.join(
					PROJECT_ROOT,
					entry.incorrect,
					"insurance.pdf"
				);
				const newPath = path.join(PROJECT_ROOT, entry.correct, "insurance.pdf");

				await moveFile(oldPath, newPath);
			}

			// Move all documentations from incorrect to correct, appending them to the end and fixing the entry index
			for (const documentation of incorrect.documentations) {
				documentation.student = correct;
				correct.documentations.add(documentation);
				documentation.documentationIdx = correct.documentations.length;

				// Iterate through every document and fix the entry index and destination path

				(await documentation.documents.init()).getItems();
				for (const document of documentation.documents) {
					const oldPath = path.join(
						PROJECT_ROOT,
						document.destPath,
						document.fileName
					);
					document.destPath = `${correct.crefito}/${
						documentation.documentationIdx
					}`;
					const newPath = path.join(
						PROJECT_ROOT,
						document.destPath,
						document.fileName
					);

					console.log(oldPath, newPath);
					await moveFile(oldPath, newPath);
				}

				db.em.persist(documentation);

				// Move documentation files on disk (assuming a similar file structure)
			}

			// Remove incorrect student
			incorrect.deleted = true;
			// Save changes to the database
			db.em.persist(correct);
			db.em.persist(incorrect);
			await db.em.flush();

			console.log(
				`Migrated student data for ${entry.studentName} from ${entry.incorrect} to ${entry.correct}`
			);
		} else {
			console.log(
				`Could not find both students for entry: ${entry.studentName}`
			);
		}
	}
}

MigrateStudent().catch((error) => {
	console.error("Migration failed:", error);
});
