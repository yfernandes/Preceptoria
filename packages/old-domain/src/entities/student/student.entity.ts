import path from "path";
import {
	Entity,
	OneToMany,
	Property,
	Collection,
	OneToOne,
	EntityRepositoryType,
} from "@mikro-orm/sqlite";

import { Documentation } from "../documentation/documentation.entity.js";
import type { ISubmission } from "../submission/submission.interface.js";
import { Document } from "../document/document.entity.js";
import { StudentRepository } from "./student.repository.js";
import { User, UserRole } from "entities/user.abstract";

@Entity({
	repository: () => StudentRepository,
})
export class Student extends User {
	[EntityRepositoryType]?: StudentRepository;
	// Personal Info

	@Property({
		unique: true,
	})
	crefito!: string;

	// Course related Info
	@Property()
	timestamp!: string;

	@OneToMany({ mappedBy: "student" })
	documentations = new Collection<Documentation>(this);

	@Property()
	course?: string; // Ex: Pos graduação em Neonatologia e Pediatria

	@Property()
	classNumber?: string;

	@OneToOne()
	insurance?: Document;

	// shifts

	//  App Data
	@Property()
	studentFolder?: string;

	@Property()
	projectRoot!: string;

	@Property({ nullable: true })
	deleted: boolean = false;

	constructor(data: ISubmission, ProjectRoot: string) {
		super(data.fullName, UserRole.Student, data.cpf, data.phone, data.email);
		this.timestamp = data.timestamp;
		this.crefito = data.crefito;
		this.projectRoot = ProjectRoot;
		this.fullName = data.fullName;
		this.email = data.email;
		this.phone = data.phone;
		this.cpf = data.cpf;
		this.classNumber = data.classNumber;

		this.setFolderName();
	}

	private setFolderName() {
		if (this.fullName) {
			this.studentFolder = path.join(
				this.projectRoot,
				"StudentsData",
				this.crefito
			);
		} else {
			console.log("Could not find crefito number");
		}
	}

	addDocumentation(submission: Documentation) {
		// Check if the documentation already exists
		if (
			this.documentations.find(
				(entry) => entry.timestamp === submission.timestamp
			)
		) {
			console.log(
				`-- Documentation with timestamp ${submission.timestamp} already exists for user with crefito ${this.crefito}`
			);
			return;
		}

		console.log(
			`-- New Documentation for ${this.fullName}\n-- Documentation Timestamp: ${submission.timestamp}`
		);

		this.documentations.add(submission);
	}
}
