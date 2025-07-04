import { google } from "googleapis";
import path from "path";
import fs from "fs";

import { DownloadStatus, type Document } from "entities";
import { PROJECT_ROOT } from "types";

export class GDrive {
	private drive;
	private credentialsFile: string = path.join(
		__dirname,
		"../../../secrets",
		"service_account.json"
	);

	scopes: string[] = [
		"https://www.googleapis.com/auth/drive",
		"https://www.googleapis.com/auth/drive.appdata",
		"https://www.googleapis.com/auth/drive.file",
		"https://www.googleapis.com/auth/drive.metadata",
		"https://www.googleapis.com/auth/drive.metadata.readonly",
		"https://www.googleapis.com/auth/drive.photos.readonly",
		"https://www.googleapis.com/auth/drive.readonly",
	];

	constructor() {
		const auth = new google.auth.GoogleAuth({
			scopes: this.scopes,
			keyFile: this.credentialsFile,
		});

		google.options({ auth });
		this.drive = google.drive({ version: "v3", auth });
	}

	private async getFileMetadata(fileId: string): Promise<Partial<Document>> {
		const res = await this.drive.files.get({
			fileId,
			fields: "name, mimeType",
		});
		if (!res.data.name || !res.data.mimeType) {
			throw new Error("File metadata is incomplete");
		}
		return {
			srcName: res.data.name,
			mimeType: res.data.mimeType,
		};
	}

	private getExtension(mimeType: string): string {
		const mimeTypes: { [key: string]: string } = {
			"application/pdf": ".pdf",
			"image/jpeg": ".jpg",
			"image/png": ".png",
			"text/plain": ".txt",
			// Add more MIME types and their corresponding extensions as needed
		};
		return mimeTypes[mimeType] || "";
	}

	private async ensureDirectoryExistence(filePath: string) {
		const dirname = path.dirname(filePath);
		if (fs.existsSync(dirname)) {
			return true;
		}
		await fs.promises.mkdir(dirname, { recursive: true });
	}

	async downloadFile(doc: Document): Promise<Document> {
		try {
			const metadata = await this.getFileMetadata(doc.sourceId);
			doc.srcName = metadata.srcName;
			if (!metadata.mimeType) {
				throw new Error("Mimetype Not found, unable to download");
			}
			const extension = this.getExtension(metadata.mimeType);
			const filePath = path.join(
				PROJECT_ROOT,
				doc.destPath,
				doc.fileName + extension
			);
			doc.extension = extension;

			await this.ensureDirectoryExistence(filePath);

			const res = await this.drive.files.get(
				{ fileId: doc.sourceId, alt: "media" },
				{ responseType: "stream" }
			);

			await new Promise((resolve, reject) => {
				console.log(`Writing to ${filePath}`);
				const destStream = fs.createWriteStream(filePath);
				let progress = 0;

				res.data
					.on("end", () => {
						console.log("Done downloading file.");
						doc.downloadStatus = DownloadStatus.Downloaded;
						resolve(filePath);
					})
					.on("error", (err) => {
						console.error("Error downloading file.", err);
						doc.downloadStatus = DownloadStatus.Error;
						reject(err);
					})
					.on("data", (d) => {
						progress += d.length;
						if (process.stdout.isTTY) {
							process.stdout.clearLine(0);
							process.stdout.cursorTo(0);
							process.stdout.write(`Downloaded ${progress} bytes`);
						}
					})
					.pipe(destStream);
			});
		} catch (error) {
			console.error("Error fetching file metadata or downloading file.", error);
			doc.downloadStatus = DownloadStatus.Error;
		}
		return doc;
	}
}
