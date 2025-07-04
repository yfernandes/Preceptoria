import type { Rel } from "@mikro-orm/core";
import {
	Entity,
	ManyToOne,
	Property,
	OneToOne,
	EntityRepositoryType,
	Enum,
} from "@mikro-orm/core";
import type { SourceId } from "../../types.js";
import {
	ApprovalStatus,
	DocumentType,
	DownloadStatus,
} from "./document.interface.js";
import type { IDocument } from "./document.interface.js";

import { BaseEntity } from "../common/base.entity.js";
import { Student } from "../student/student.entity.js";
import { Documentation } from "../documentation/documentation.entity.js";
import { DocumentRepository } from "./document.repository.js";
import type { DocumentTag } from "./document.tags.js";

@Entity({
	repository: () => DocumentRepository,
})
export class Document extends BaseEntity implements IDocument {
	[EntityRepositoryType]?: DocumentRepository;

	@Property({
		comment:
			"The id extracted from the google drive url, from google sheets table",
	})
	sourceId!: SourceId;

	@Property()
	fileName!: string;

	@Property()
	destPath!: string; // = CrefitoNumber/EntryIndex

	// TODO: Decide if we take the file name as is to make it easier to compare with other user submissions
	// Or change it to be more inline with the system format.
	@Property({ comment: "File name as submitted by the user" })
	srcName?: string;

	@Property()
	mimeType?: string;

	@Property()
	extension?: string;

	@Enum(() => DownloadStatus)
	downloadStatus!: DownloadStatus;

	@Enum(() => ApprovalStatus)
	approvalStatus!: ApprovalStatus;

	@Enum(() => DocumentType)
	documentType!: DocumentType;

	@ManyToOne({ nullable: true })
	documentation?: Rel<Documentation>;

	@OneToOne({
		mappedBy: "insurance",
		nullable: true,
	})
	student?: Rel<Student>;

	// TODO: In the future add validation such that a document cannot have tags of another document type
	@Property()
	tags: DocumentTag[] = [];

	constructor(
		sourceId: SourceId,
		documentType: DocumentType,
		fileName: string,
		destPath: string
	) {
		super();
		this.sourceId = sourceId;
		this.downloadStatus = DownloadStatus.NotDownloaded;
		this.approvalStatus = ApprovalStatus.NotReviewed;
		this.documentType = documentType;
		this.fileName = fileName;
		this.destPath = destPath;
	}

	static CreateDocumentFromSourceId(
		sourceId: SourceId,
		documentType: DocumentType,
		fileIndex: number,
		entryIndex: number,
		crefito: string
	) {
		if (
			documentType !== DocumentType.insurance &&
			documentType !== DocumentType.badgePicture
		) {
			return new Document(
				sourceId,
				documentType,
				`${documentType} ${fileIndex + 1}`,
				`${crefito}/Entry - ${entryIndex + 1}`
			);
		}
		return new Document(
			sourceId,
			documentType,
			`${documentType}`,
			`${crefito}/Entry - ${entryIndex + 1}`
		);
	}
}
