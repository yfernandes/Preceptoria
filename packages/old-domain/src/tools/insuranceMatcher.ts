import path from "path";
import fs from "fs/promises";

import { Document, DocumentType, Student } from "entities";
import { Normalize } from "./normalizer";
import { type Services } from "db";
import { PROJECT_ROOT } from "types";

export async function matchInsuranceFilesToStudents(db: Services) {
	const insuranceDir = path.join(PROJECT_ROOT, "insurances");
	const students = await db.student.findAll({
		populate: ["insurance", "documentations"],
	});
	try {
		// Read all files in the insurance directory
		const files = (await fs.readdir(insuranceDir, { withFileTypes: true }))
			.filter((dirent) => dirent.isFile())
			.map((dirent) => dirent.name);
		// .slice(0, 1);

		const matchedStudents: { file: string; student: Student | null }[] = [];

		for (const [index, file] of files.entries()) {
			const fileName = path.basename(file, path.extname(file));

			console.log(
				`\n\n\n\n\n----------------------\nProcessing file: ${file} (${index + 1}/${files.length})`
			);

			// Use the provided regex to extract the CPF
			const cpfRegex = /([A-Z]+_)+(\d{11}).*/;
			const matches = fileName.match(cpfRegex);

			console.log(`Regex matches: ${matches}`);

			// Extract the CPF if regex matches
			const extractedCpf = matches ? Normalize.cpf(matches[2]) : null;
			console.log(`Extracted CPF: ${extractedCpf}`);
			if (typeof extractedCpf === "string") {
				// Find the student by matching the extracted CPF
				const matchedStudent = students.find(
					(student) => student.cpf === extractedCpf
				);

				if (!matchedStudent) {
					console.log(`No match for CPF ${extractedCpf} in ${file}`);
				}

				matchedStudents.push({ file, student: matchedStudent || null });
			} else {
				console.log(`CPF not found in file name: ${file}`);
				matchedStudents.push({ file, student: null });
			}
		}

		// Write all files to the insurance directory
		console.log(
			"\n\n\n\n\n----------------------\nWriting files to insurances directory..."
		);

		for (const { file, student } of matchedStudents) {
			if (student) {
				console.log(`Processing matched student: ${student.fullName}`);
				student.insurance = Document.CreateDocumentFromSourceId(
					"none",
					DocumentType.insurance,
					0,
					student.documentations.length,
					student.crefito
				);
				console.log(`Matched ${file} to ${student.fullName}`);
				console.log(student.insurance);

				await db.em.persistAndFlush(student);

				const destPath = path.join(
					PROJECT_ROOT,
					path.dirname(student.insurance.destPath)
				);
				// // Ensure destination directory exists
				await fs.mkdir(destPath, {
					recursive: true,
				});

				// // Move the file to the correct folder
				await fs.rename(
					path.join(insuranceDir, file),
					`${destPath}/${student.insurance.fileName}.pdf`
				);
			}
		}
		return students;
	} catch (error) {
		console.error("Error matching insurance files to students:", error);
	}
}
