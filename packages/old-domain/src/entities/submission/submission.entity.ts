import {
	Entity,
	EntityRepositoryType,
	Property,
	Unique,
} from "@mikro-orm/core";
import type {
	ISubmission,
	SubmissionDocumentation,
} from "./submission.interface.js";
import { BaseEntity } from "../common/base.entity.js";
import { SubmissionRepository } from "./submission.repository.js";

@Entity({
	repository: () => SubmissionRepository,
})
@Unique({ properties: ["timestamp", "crefito"] })
export class Submission extends BaseEntity implements ISubmission {
	[EntityRepositoryType]?: SubmissionRepository;

	@Property()
	timestamp: string;

	@Property()
	crefito: string;

	// A submission documentation will always be provided even if it only contains empty array
	@Property({ type: "json" })
	documentation: SubmissionDocumentation;

	@Property()
	fullName?: string;

	@Property()
	email?: string;

	@Property()
	phone?: string;

	@Property()
	cpf?: string;

	@Property()
	classNumber?: string;

	@Property()
	studentsSchoolId?: string;

	@Property()
	classSupervisor?: string;

	constructor(data: ISubmission) {
		super();
		this.timestamp = data.timestamp;
		this.crefito = data.crefito;
		this.documentation = data.documentation;
		this.fullName = data.fullName;
		this.email = data.email;
		this.phone = data.phone;
		this.cpf = data.cpf;
		this.classNumber = data.classNumber;
		this.studentsSchoolId = data.studentsSchoolId;
		this.classSupervisor = data.classSupervisor;
	}
}
