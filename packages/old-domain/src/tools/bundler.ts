import { statSync } from "fs";
import { mkdir, copyFile } from "fs/promises";
import path from "path";

import { globby } from "globby";
import { $ } from "bun";

import { PROJECT_ROOT } from "types";

export async function copyCompleteFiles() {
	const distFolder = path.join(PROJECT_ROOT, "deliverables");
	await mkdir(distFolder, { recursive: true });

	const files = await globby(`${PROJECT_ROOT}/**/* - Completo.pdf`);
	for (const file of files) {
		const fileName = path.basename(file);
		const targetPath = path.join(distFolder, fileName);
		await copyFile(file, targetPath);
		console.log(`Copied: ${file} to ${targetPath}`);
	}
}
export const KB = 1024;
export const MB = 1024 * KB;

export async function bundlePDFs(bundleSize: number = 25 * MB) {
	console.log("Starting to bundle PDFs...");

	// Get all PDFs
	const pdfPaths = await globby(
		`${PROJECT_ROOT}/deliverables/* - Completo.pdf`
	);
	console.log(`Found ${pdfPaths.length} PDFs.`);

	// Get the size of PDFs
	const pdfs = pdfPaths.map((pdfPath) => {
		const stats = statSync(pdfPath);
		return {
			path: pdfPath,
			size: stats.size,
		};
	});

	// Order the PDFs by reverse size order (largest first)
	pdfs.sort((a, b) => b.size - a.size);

	let bundleCount = 0;
	while (pdfs.length > 0) {
		console.log(`Processing bundle ${bundleCount + 1}...`);

		let currentBundleSize = 0;
		const currentBundle: string[] = [];

		for (let i = 0; i < pdfs.length; i++) {
			if (currentBundleSize + pdfs[i].size <= bundleSize) {
				currentBundle.push(pdfs[i].path);
				currentBundleSize += pdfs[i].size;
				pdfs.splice(i, 1);
				i--; // adjust index after removal
			}
		}

		if (currentBundle.length > 0) {
			// Create a zip bundle directly with flat structure
			const bundleZipPath = `${PROJECT_ROOT}/deliverables/bundles/bundle-${bundleCount + 1}.zip`;

			// Explicitly handle empty array edge case
			if (currentBundle.length === 0) {
				console.warn("No files to zip for this bundle.");
				continue;
			}

			try {
				// Zip the PDFs directly with a flat structure using the `-j` flag
				await $`zip -j ${bundleZipPath} ${currentBundle}`;
				console.log(`Created bundle: ${bundleZipPath}`);
				bundleCount++;
			} catch (error) {
				console.error("Error creating the zip file:", error);
			}
		} else {
			console.warn("Remaining PDFs are too large to fit into the bundle size.");
			break;
		}
	}

	console.log("All bundles created.");
}

await bundlePDFs(25 * MB);
