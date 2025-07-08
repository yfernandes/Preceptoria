import path from "path";
import { readFileSync, writeFileSync } from "fs";

import { PDFDocument, PageSizes } from "pdf-lib";

import { type Document, DocumentType } from "entities";
import { PROJECT_ROOT } from "types";

export async function mergePdfAndImages(files: Document[], crefito: string) {
	console.log("---- Processing PDFs and images...");

	if (files.length === 0) return;

	const outputPath = path.join(
		PROJECT_ROOT,
		files[0].destPath,
		"..",
		`${crefito} - Completo.pdf`
	);

	// console.log(`--- Output path: ${outputPath}`);

	const images = files.filter((file) => file.extension === ".jpg");
	const pdfs = files.filter((file) => file.extension === ".pdf");

	// console.log(`Images: ${images.length}, PDFs: ${pdfs.length}`);

	// console.log("Creating merged PDF...");
	const pdfDoc = await PDFDocument.create();

	for (const pdf of pdfs) {
		// console.log(`--------------- Adding PDF: ${pdf.fileName}.pdf...`);
		let fullPath = "";
		if (pdf.documentType == DocumentType.insurance) {
			console.log("Got Insurance");
			fullPath = path.join(PROJECT_ROOT, crefito, `${pdf.fileName}.pdf`);
		} else {
			fullPath = path.join(PROJECT_ROOT, pdf.destPath, `${pdf.fileName}.pdf`);
		}
		// console.log(`Reading PDF: ${pdf.fileName}.pdf at ${fullPath}`);
		// console.log(pdf, fullPath);
		const pdfBytes = readFileSync(fullPath);

		// console.log("Loading PDF...");
		const externalPdf = await PDFDocument.load(pdfBytes);

		// const pageCount = externalPdf.getPageCount();
		const pages = externalPdf.getPages();

		// console.log(
		// 	`Embedding ${pageCount} pages from PDF: ${pdf.fileName}.pdf...`
		// );
		const embeddedPages = await pdfDoc.embedPages(pages);

		for (const embeddedPage of embeddedPages) {
			const { width, height } = embeddedPage.size();
			// console.log(`Embedded Page Size: ${width} x ${height}`);

			const [targetWidth, targetHeight] = PageSizes.A4;

			const scale = Math.min(targetWidth / width, targetHeight / height);
			const newWidth = width * scale;
			const newHeight = height * scale;

			const newPage = pdfDoc.addPage([targetWidth, targetHeight]);

			newPage.drawPage(embeddedPage, {
				x: (targetWidth - newWidth) / 2,
				y: (targetHeight - newHeight) / 2,
				xScale: scale,
				yScale: scale,
			});
		}

		// console.log(`PDF ${pdf.fileName}.pdf added to merged PDF.`);
		// console.log("------------------");
	}

	for (const imageEntry of images) {
		// console.log(`--------------- Adding image: ${imageEntry.fileName}.jpg...`);
		const fullPath = path.join(
			PROJECT_ROOT,
			imageEntry.destPath,
			`${imageEntry.fileName}${imageEntry.extension}`
		);

		// console.log(`Reading image: ${imageEntry.fileName}.jpg at ${fullPath}`);
		const imageBytes = readFileSync(fullPath);

		// console.log("Loading image...");
		const image = await pdfDoc.embedJpg(imageBytes);

		// console.log("Adding image to merged PDF...");
		const page = pdfDoc.addPage(PageSizes.A4);
		const { width, height } = image.scale(1);

		const xScale = PageSizes.A4[0] / width;
		const yScale = PageSizes.A4[1] / height;

		const scale = Math.min(xScale, yScale);
		const newWidth = width * scale;
		const newHeight = height * scale;

		page.drawImage(image, {
			x: (PageSizes.A4[0] - newWidth) / 2,
			y: (PageSizes.A4[1] - newHeight) / 2,
			width: newWidth,
			height: newHeight,
		});
	}

	const mergedPdfBytes = await pdfDoc.save();
	// console.log(`Saving merged PDF to:${outputPath}`);
	writeFileSync(outputPath, mergedPdfBytes);
	// console.log(`Merged PDF saved to ${outputPath}`);
	console.log("-------------------- Done Processing --------------------");
}
