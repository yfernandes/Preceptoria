// Move all insurance files to the correct folder
// From: packages/core/Students/158768-F/insurance.pdf
// Generalized to packages/core/Students/**/insurance.pdf
// To: packages/core/db/studentData/158768-F/insurance.pdf
// Generalized to packages/core/db/studentData/**/insurance.pdf

import path from "path";
import { readdirSync, renameSync, existsSync, mkdirSync } from "fs";
import { PROJECT_ROOT } from "types";

export async function moveInsuranceFiles() {
	console.log("Starting file moving process...");
	const startingFolder = path.join(PROJECT_ROOT, "..", "..", "Students");
	const targetFolder = path.join(PROJECT_ROOT);
	console.log(`Starting folder: ${startingFolder}`);
	console.log(`Target folder: ${targetFolder}`);

	// Function to recursively find all folders
	const getAllFolders = (dir: string): string[] => {
		const results: string[] = [];
		console.log(`Processing folder: ${dir}`);
		const list = readdirSync(dir, { withFileTypes: true });
		list.forEach((file) => {
			const filePath = path.join(dir, file.name);
			if (file.isDirectory()) {
				results.push(...getAllFolders(filePath));
			} else if (file.isFile() && file.name === "insurance.pdf") {
				results.push(dir);
			}
		});
		console.log(`Found ${results.length} folders in ${dir}`);
		return results;
	};

	const folders = getAllFolders(startingFolder);
	console.log(`Folders to process: ${folders.length}`);

	for (const folder of folders) {
		console.log(`Processing folder: ${folder}`);
		const relativePath = path.relative(startingFolder, folder);
		const targetPath = path.join(targetFolder, relativePath);

		// Ensure the target directory exists
		if (!existsSync(targetPath)) {
			console.log(`Creating directory: ${targetPath}`);
			mkdirSync(targetPath, { recursive: true });
		}

		const oldFilePath = path.join(folder, "insurance.pdf");
		const newFilePath = path.join(targetPath, "insurance.pdf");

		try {
			renameSync(oldFilePath, newFilePath);
			console.log(`Moved insurance.pdf from ${folder} to ${targetPath}`);
		} catch (error) {
			console.error(
				`Failed to move insurance.pdf from ${folder} to ${targetPath}:`,
				error
			);
		}
	}

	console.log("File moving process completed.");
}

moveInsuranceFiles();
