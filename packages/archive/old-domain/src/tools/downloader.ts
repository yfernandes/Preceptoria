import path from "path";
import { GDrive } from "tools";
import { type Services } from "../db.js";
import {
	DocumentType,
	DownloadStatus,
} from "../entities/document/document.interface.js";

export async function downloadFiles(db: Services) {
	const gDrive = new GDrive();
	// console.log("Downloading files...");
	const documentsToDownload = await db.document.find({
		$and: [
			{ downloadStatus: DownloadStatus.NotDownloaded },
			{ documentType: { $ne: DocumentType.insurance } },
		],
	});

	console.log("Documents to download:", documentsToDownload.length);

	for (const document of documentsToDownload) {
		// console.log(`Downloading ${document.fileName}`);
		console.log(document);
		await gDrive.downloadFile(document);
		db.em.persistAndFlush(document);
	}

	await Bun.write(
		path.join(__dirname, "../../log/downloadList.json"),
		JSON.stringify(documentsToDownload, null, 2)
	);
}
