import { describe, it, expect, beforeEach } from "bun:test";
import { Document, DocumentType, DocumentStatus } from "./document.entity";
import {
	User,
	Student,
	Classes,
	Course,
	School,
	Supervisor,
} from "@api/modules/entities";

describe("Document Entity", () => {
	let mockUser: User;
	let mockStudent: Student;
	let mockClasses: Classes;
	let mockCourse: Course;
	let mockSchool: School;
	let mockSupervisor: Supervisor;

	beforeEach(async () => {
		// Create a minimal mock user for testing
		mockUser = await User.create(
			"Test User",
			"test@example.com",
			"+5511999999999",
			"password123"
		);

		// Create minimal mock objects for relationships
		mockSchool = new School(
			"Test School",
			"Test Address",
			"school@test.com",
			"+5511888888888"
		);
		mockSupervisor = new Supervisor(mockUser, mockSchool);
		mockCourse = new Course("Test Course", mockSchool, mockSupervisor);
		mockClasses = new Classes("Test Class", mockCourse);
		mockStudent = new Student(mockUser, mockClasses);
	});

	describe("Constructor", () => {
		it("should create a document with required fields", () => {
			const document = new Document(
				"Test Document",
				DocumentType.PROFESSIONAL_ID,
				"https://example.com/document.pdf",
				mockStudent
			);

			expect(document.name).toBe("Test Document");
			expect(document.type).toBe(DocumentType.PROFESSIONAL_ID);
			expect(document.url).toBe("https://example.com/document.pdf");
			expect(document.student).toBe(mockStudent);
			expect(document.status).toBe(DocumentStatus.PENDING);
			expect(document.isRequired).toBe(true);
			expect(document.isPublic).toBe(false);
		});

		it("should create a document with optional fields", () => {
			const expiresAt = new Date("2025-12-31");
			const document = new Document(
				"Test Document",
				DocumentType.VACCINATION_CARD,
				"https://example.com/vaccine.pdf",
				mockStudent,
				"Vaccination record",
				expiresAt,
				false
			);

			expect(document.description).toBe("Vaccination record");
			expect(document.expiresAt).toEqual(expiresAt);
			expect(document.isRequired).toBe(false);
		});
	});

	describe("isExpired()", () => {
		it("should return false when no expiration date is set", () => {
			const document = new Document(
				"Test Document",
				DocumentType.PROFESSIONAL_ID,
				"https://example.com/document.pdf",
				mockStudent
			);

			expect(document.isExpired()).toBe(false);
		});

		it("should return false when expiration date is in the future", () => {
			const futureDate = new Date();
			futureDate.setFullYear(futureDate.getFullYear() + 1);

			const document = new Document(
				"Test Document",
				DocumentType.PROFESSIONAL_ID,
				"https://example.com/document.pdf",
				mockStudent,
				undefined,
				futureDate
			);

			expect(document.isExpired()).toBe(false);
		});

		it("should return true when expiration date is in the past", () => {
			const pastDate = new Date();
			pastDate.setFullYear(pastDate.getFullYear() - 1);

			const document = new Document(
				"Test Document",
				DocumentType.PROFESSIONAL_ID,
				"https://example.com/document.pdf",
				mockStudent,
				undefined,
				pastDate
			);

			expect(document.isExpired()).toBe(true);
		});
	});

	describe("isValid()", () => {
		it("should return true for approved document that is not expired", () => {
			const futureDate = new Date();
			futureDate.setFullYear(futureDate.getFullYear() + 1);

			const document = new Document(
				"Test Document",
				DocumentType.PROFESSIONAL_ID,
				"https://example.com/document.pdf",
				mockStudent,
				undefined,
				futureDate
			);
			document.approve(mockUser);

			expect(document.isValid()).toBe(true);
		});

		it("should return false for approved document that is expired", () => {
			const pastDate = new Date();
			pastDate.setFullYear(pastDate.getFullYear() - 1);

			const document = new Document(
				"Test Document",
				DocumentType.PROFESSIONAL_ID,
				"https://example.com/document.pdf",
				mockStudent,
				undefined,
				pastDate
			);
			document.approve(mockUser);

			expect(document.isValid()).toBe(false);
		});

		it("should return false for pending document", () => {
			const document = new Document(
				"Test Document",
				DocumentType.PROFESSIONAL_ID,
				"https://example.com/document.pdf",
				mockStudent
			);

			expect(document.isValid()).toBe(false);
		});

		it("should return false for rejected document", () => {
			const document = new Document(
				"Test Document",
				DocumentType.PROFESSIONAL_ID,
				"https://example.com/document.pdf",
				mockStudent
			);
			document.reject(mockUser, "Invalid document");

			expect(document.isValid()).toBe(false);
		});
	});

	describe("canBeVerified()", () => {
		it("should return true for pending document", () => {
			const document = new Document(
				"Test Document",
				DocumentType.PROFESSIONAL_ID,
				"https://example.com/document.pdf",
				mockStudent
			);

			expect(document.canBeVerified()).toBe(true);
		});

		it("should return false for approved document", () => {
			const document = new Document(
				"Test Document",
				DocumentType.PROFESSIONAL_ID,
				"https://example.com/document.pdf",
				mockStudent
			);
			document.approve(mockUser);

			expect(document.canBeVerified()).toBe(false);
		});

		it("should return false for rejected document", () => {
			const document = new Document(
				"Test Document",
				DocumentType.PROFESSIONAL_ID,
				"https://example.com/document.pdf",
				mockStudent
			);
			document.reject(mockUser, "Invalid document");

			expect(document.canBeVerified()).toBe(false);
		});
	});

	describe("approve()", () => {
		it("should approve a pending document", () => {
			const document = new Document(
				"Test Document",
				DocumentType.PROFESSIONAL_ID,
				"https://example.com/document.pdf",
				mockStudent
			);

			document.approve(mockUser, "Document looks good");

			expect(document.status).toBe(DocumentStatus.APPROVED);
			expect(document.verifiedBy).toBe(mockUser);
			expect(document.verifiedAt).toBeInstanceOf(Date);
			expect(document.validationNotes).toBe("Document looks good");
		});

		it("should approve without notes", () => {
			const document = new Document(
				"Test Document",
				DocumentType.PROFESSIONAL_ID,
				"https://example.com/document.pdf",
				mockStudent
			);

			document.approve(mockUser);

			expect(document.status).toBe(DocumentStatus.APPROVED);
			expect(document.verifiedBy).toBe(mockUser);
			expect(document.verifiedAt).toBeInstanceOf(Date);
			expect(document.validationNotes).toBeUndefined();
		});
	});

	describe("reject()", () => {
		it("should reject a pending document", () => {
			const document = new Document(
				"Test Document",
				DocumentType.PROFESSIONAL_ID,
				"https://example.com/document.pdf",
				mockStudent
			);

			document.reject(
				mockUser,
				"Document is incomplete",
				"Please provide all pages"
			);

			expect(document.status).toBe(DocumentStatus.REJECTED);
			expect(document.verifiedBy).toBe(mockUser);
			expect(document.verifiedAt).toBeInstanceOf(Date);
			expect(document.rejectionReason).toBe("Document is incomplete");
			expect(document.validationNotes).toBe("Please provide all pages");
		});

		it("should reject without notes", () => {
			const document = new Document(
				"Test Document",
				DocumentType.PROFESSIONAL_ID,
				"https://example.com/document.pdf",
				mockStudent
			);

			document.reject(mockUser, "Document is incomplete");

			expect(document.status).toBe(DocumentStatus.REJECTED);
			expect(document.verifiedBy).toBe(mockUser);
			expect(document.verifiedAt).toBeInstanceOf(Date);
			expect(document.rejectionReason).toBe("Document is incomplete");
			expect(document.validationNotes).toBeUndefined();
		});
	});

	describe("updateValidationChecks()", () => {
		it("should update validation checks", () => {
			const document = new Document(
				"Test Document",
				DocumentType.VACCINATION_CARD,
				"https://example.com/vaccine.pdf",
				mockStudent
			);

			document.updateValidationChecks({
				hasVaccineA: true,
				hasVaccineB: false,
			});

			expect(document.validationChecks).toEqual({
				hasVaccineA: true,
				hasVaccineB: false,
			});
		});

		it("should merge with existing validation checks", () => {
			const document = new Document(
				"Test Document",
				DocumentType.VACCINATION_CARD,
				"https://example.com/vaccine.pdf",
				mockStudent
			);

			document.updateValidationChecks({ hasVaccineA: true });
			document.updateValidationChecks({
				hasVaccineB: false,
				hasVaccineC: true,
			});

			expect(document.validationChecks).toEqual({
				hasVaccineA: true,
				hasVaccineB: false,
				hasVaccineC: true,
			});
		});
	});
});
