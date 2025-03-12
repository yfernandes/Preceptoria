import {
	type Rel,
	Entity,
	Enum,
	ManyToOne,
	Property,
} from "@mikro-orm/postgresql";
import { IsUrl } from "class-validator";

import { BaseEntity } from "./baseEntity";

import { Student } from "./student.entity";

export enum DocumentType {}

@Entity()
export class Document extends BaseEntity {
	@ManyToOne() // One user can have many Documents
	student: Rel<Student>;

	@Property()
	name: string;

	@Enum(() => DocumentType)
	type: DocumentType;

	@Property()
	@IsUrl()
	url: string;

	@Property()
	uploadedAt = new Date();

	@Property()
	verified = false;

	constructor(
		name: string,
		type: DocumentType,
		url: string,
		uploadedAt: Date,
		user: Rel<Student>
	) {
		super();
		this.name = name;
		this.type = type;
		this.url = url;
		this.uploadedAt = uploadedAt;
		this.student = user;
	}
}
