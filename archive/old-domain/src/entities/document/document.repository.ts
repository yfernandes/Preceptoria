import { EntityRepository } from "@mikro-orm/sqlite"
import type { Document } from "./document.entity.js"
import { DownloadStatus } from "./document.interface.js"

export class DocumentRepository extends EntityRepository<Document> {
	async findBy() {
		await this.findAll({
			where: { downloadStatus: DownloadStatus.NotDownloaded },
		})
	}
}
