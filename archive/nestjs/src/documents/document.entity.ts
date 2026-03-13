import { Entity, EntityRepositoryType, Enum, ManyToOne, Property, type Rel } from "@mikro-orm/core"
import { IsUrl } from "class-validator"
import { BaseEntity } from "src/baseEntity"
import type { Student } from "src/student/student.entity"
import { DocumentRepository } from "./document.repository"

export enum DocumentType {}

@Entity({ repository: () => DocumentRepository })
export class Document extends BaseEntity {
	[EntityRepositoryType]?: DocumentRepository

	@ManyToOne() // One user can have many Documents
	student: Rel<Student>

	@Property()
	name: string

	@Enum(() => DocumentType)
	type: DocumentType

	@Property()
	@IsUrl()
	url: string

	@Property()
	uploadedAt = new Date()

	@Property()
	verified: boolean = false

	constructor(name: string, type: DocumentType, url: string, uploadedAt: Date, user: Rel<Student>) {
		super()
		this.name = name
		this.type = type
		this.url = url
		this.uploadedAt = uploadedAt
		this.student = user
	}
}
