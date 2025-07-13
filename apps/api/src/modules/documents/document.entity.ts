import {
	type Rel,
	Entity,
	Enum,
	ManyToOne,
	Property,
} from "@mikro-orm/postgresql";
import { IsUrl } from "class-validator";

import { BaseEntity } from "../common/baseEntity";
import { Student } from "../students/student.entity";
import { User } from "../user/user.entity";

export enum DocumentType {
	PROFESSIONAL_ID = "PROFESSIONAL_ID", // e.g., Crefito for physiotherapists
	VACCINATION_CARD = "VACCINATION_CARD",
	COMMITMENT_CONTRACT = "COMMITMENT_CONTRACT",
	ADMISSION_FORM = "ADMISSION_FORM",
	BADGE_PICTURE = "BADGE_PICTURE",
	INSURANCE_DOCUMENTATION = "INSURANCE_DOCUMENTATION",
	OTHER = "OTHER",
}

export enum DocumentStatus {
	PENDING = "PENDING",
	APPROVED = "APPROVED",
	REJECTED = "REJECTED",
	EXPIRED = "EXPIRED",
}

@Entity()
export class Document extends BaseEntity {
	@ManyToOne(() => Student)
	student: Rel<Student>;

	@Property()
	name: string;

	@Property({ nullable: true })
	description?: string;

	@Enum(() => DocumentType)
	type: DocumentType;

	@Property()
	@IsUrl()
	url: string;

	@Property({ nullable: true })
	thumbnailUrl?: string;

	@Property()
	uploadedAt = new Date();

	@Property({ nullable: true })
	expiresAt?: Date;

	@Enum(() => DocumentStatus)
	status: DocumentStatus = DocumentStatus.PENDING;

	@Property({ nullable: true })
	rejectionReason?: string;

	@ManyToOne(() => User, { nullable: true })
	verifiedBy?: Rel<User>;

	@Property({ nullable: true })
	verifiedAt?: Date;

	@Property({ nullable: true })
	fileSize?: number; // in bytes

	@Property({ nullable: true })
	mimeType?: string;

	@Property({ default: false })
	isRequired = true;

	@Property({ default: false })
	isPublic = false; // for documents that can be viewed by hospital managers

	// Validation fields
	@Property({ type: "json", nullable: true })
	validationChecks?: Record<string, boolean>; // e.g., { "hasVaccineA": true, "hasVaccineB": false }

	@Property({ nullable: true })
	validationNotes?: string; // Additional notes from supervisor

	@Property({ nullable: true })
	originalFileName?: string; // Original filename from Google Drive

	@Property({ nullable: true })
	googleDriveId?: string; // Google Drive file ID for reference

	constructor(
		name: string,
		type: DocumentType,
		url: string,
		student: Rel<Student>,
		description?: string,
		expiresAt?: Date,
		isRequired = true
	) {
		super();
		this.name = name;
		this.type = type;
		this.url = url;
		this.student = student;
		this.description = description;
		this.expiresAt = expiresAt;
		this.isRequired = isRequired;
	}

	// Helper methods
	isExpired(): boolean {
		return this.expiresAt ? new Date() > this.expiresAt : false;
	}

	isValid(): boolean {
		return this.status === DocumentStatus.APPROVED && !this.isExpired();
	}

	canBeVerified(): boolean {
		return this.status === DocumentStatus.PENDING;
	}

	// Validation helpers
	updateValidationChecks(checks: Record<string, boolean>): void {
		this.validationChecks = { ...this.validationChecks, ...checks };
	}

	approve(verifiedBy: Rel<User>, notes?: string): void {
		this.status = DocumentStatus.APPROVED;
		this.verifiedBy = verifiedBy;
		this.verifiedAt = new Date();
		if (notes) this.validationNotes = notes;
	}

	reject(verifiedBy: Rel<User>, reason: string, notes?: string): void {
		this.status = DocumentStatus.REJECTED;
		this.verifiedBy = verifiedBy;
		this.verifiedAt = new Date();
		this.rejectionReason = reason;
		if (notes) this.validationNotes = notes;
	}
}
