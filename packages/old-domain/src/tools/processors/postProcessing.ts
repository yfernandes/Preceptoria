import type { Services } from "db";
import { bundlePDFs, copyCompleteFiles } from "tools/bundler";
import { compileDocumentation } from "tools/compiler";

export async function postProcessing(db: Services): Promise<void> {
	// TODO: Scale and Compress images (Raw and Extracted)

	// TODO: Merge Approved Documents into single PDF
	// 1st step: Gather all approved documents

	compileDocumentation(db);

	// Move All documents to deliverables folder
	copyCompleteFiles();

	// Bundle PDFs into 25 MB packages
	bundlePDFs();
}
