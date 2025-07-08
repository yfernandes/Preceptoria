import {
	Entity,
	ManyToOne,
	Property,
	Collection,
	OneToMany,
	type Rel,
	EntityRepositoryType,
} from "@mikro-orm/core";
import { Student } from "../student/student.entity.js";
import { Document } from "../document/document.entity.js"; // assuming you have a Document entity

import { BaseEntity } from "../common/base.entity.js";
import { DocumentationRepository } from "./documentation.repository.js";

@Entity({
	repository: () => DocumentationRepository,
})
export class Documentation extends BaseEntity {
	[EntityRepositoryType]?: DocumentationRepository;

	@Property()
	timestamp!: string;

	@Property()
	documentationIdx!: number;

	@Property()
	shortName?: string;

	@Property()
	destPath?: string;

	@ManyToOne()
	student!: Rel<Student>;

	@OneToMany(() => Document, (document) => document.documentation, {})
	documents = new Collection<Document>(this);

	constructor(timestamp: string, documentationIdx: number, destPath?: string) {
		super();
		this.timestamp = timestamp;
		this.documentationIdx = documentationIdx;
		this.destPath = destPath; // Student Folder - Crefito Number
	}

	includeDocuments(rawDocuments?: Array<Document>) {
		if (rawDocuments) {
			rawDocuments.forEach((doc) => this.documents.add(doc));
		}
	}
}
