import { db } from "../db";
import {
	Student,
	Document,
	User,
	School,
	Classes,
	Course,
	Supervisor,
} from "../entities";
import { GoogleSheetsService, GoogleSheetsSubmission } from "./googleSheets";
import { DocumentType } from "../entities/document.entity";

export interface SyncResult {
	success: boolean;
	message: string;
	stats: {
		totalSubmissions: number;
		newStudents: number;
		newDocuments: number;
		errors: string[];
	};
}

export class SyncService {
	private googleSheets: GoogleSheetsService;

	constructor() {
		this.googleSheets = new GoogleSheetsService();
	}

	async syncFromGoogleSheets(
		spreadsheetId: string,
		range = "JoinedForm"
	): Promise<SyncResult> {
		const result: SyncResult = {
			success: true,
			message: "Sync completed successfully",
			stats: {
				totalSubmissions: 0,
				newStudents: 0,
				newDocuments: 0,
				errors: [],
			},
		};

		try {
			console.log("Starting Google Sheets sync...");

			// Fetch submissions from Google Sheets
			const submissions = await this.googleSheets.getSubmissions(
				spreadsheetId,
				range
			);
			result.stats.totalSubmissions = submissions.length;

			if (submissions.length === 0) {
				result.message = "No submissions found in Google Sheets";
				return result;
			}

			// Process each submission
			for (const submission of submissions) {
				try {
					await this.processSubmission(submission, result);
				} catch (error) {
					const errorMsg = `Error processing submission for ${submission.fullName}: ${error instanceof Error ? error.message : "Unknown error"}`;
					console.error(errorMsg);
					result.stats.errors.push(errorMsg);
				}
			}

			// Flush all changes
			await db.em.flush();

			console.log(
				`Sync completed. Processed ${submissions.length} submissions.`
			);
			console.log(
				`Created ${result.stats.newStudents} new students and ${result.stats.newDocuments} new documents.`
			);

			if (result.stats.errors.length > 0) {
				result.success = false;
				result.message = `Sync completed with ${result.stats.errors.length} errors`;
			}
		} catch (error) {
			result.success = false;
			result.message = `Sync failed: ${error instanceof Error ? error.message : "Unknown error"}`;
			console.error("Sync failed:", error);
		}

		return result;
	}

	private async processSubmission(
		submission: GoogleSheetsSubmission,
		result: SyncResult
	): Promise<void> {
		// Check if student already exists by crefito (we'll need to add this field to Student entity)
		let student = await db.student.findOne({
			user: { email: submission.email },
		});

		if (!student) {
			// Create new student
			student = await this.createStudentFromSubmission(submission);
			result.stats.newStudents++;
		}

		// Process documents
		await this.processDocuments(submission, student, result);
	}

	private async createStudentFromSubmission(
		submission: GoogleSheetsSubmission
	): Promise<Student> {
		// Create or find user
		let user = await db.user.findOne({ email: submission.email });

		if (!user) {
			user = await User.create(
				submission.fullName,
				submission.email,
				submission.phone,
				this.generateTemporaryPassword() // Will need to be changed on first login
			);
			await db.em.persist(user);
		}

		// Find or create school (using studentsSchoolId as school name for now)
		let school = await db.school.findOne({ name: submission.studentsSchoolId });

		if (!school) {
			// Create a default school if it doesn't exist
			school = new School(
				submission.studentsSchoolId,
				"Address to be updated",
				"school@example.com",
				"+5500000000000"
			);
			await db.em.persist(school);
		}

		// Find or create supervisor (using a default supervisor for now)
		let supervisor = await db.supervisor.findOne({
			user: { email: "supervisor@example.com" },
		});

		if (!supervisor) {
			// Create a default supervisor if it doesn't exist
			const supervisorUser = await User.create(
				"Default Supervisor",
				"supervisor@example.com",
				"Phone to be updated",
				this.generateTemporaryPassword()
			);
			await db.em.persist(supervisorUser);

			supervisor = new Supervisor(supervisorUser, school);
			await db.em.persist(supervisor);
		}

		// Find or create course (using classNumber as course name for now)
		let course = await db.course.findOne({ name: submission.classNumber });

		if (!course) {
			// Create a default course if it doesn't exist
			course = new Course(submission.classNumber, school, supervisor);
			await db.em.persist(course);
		}

		// Find or create class
		let classEntity = await db.classes.findOne({
			course: course.id,
			name: submission.classNumber,
		});

		if (!classEntity) {
			classEntity = new Classes(submission.classNumber, course);
			await db.em.persist(classEntity);
		}

		// Create student
		const student = new Student(user, classEntity);
		await db.em.persist(student);

		return student;
	}

	private async processDocuments(
		submission: GoogleSheetsSubmission,
		student: Student,
		result: SyncResult
	): Promise<void> {
		const { documentation } = submission;

		// Process vaccination card
		for (const url of documentation.vaccinationCard) {
			await this.createDocumentFromUrl(
				url,
				student,
				DocumentType.VACCINATION_CARD,
				result
			);
		}

		// Process professional identity front
		for (const url of documentation.professionalIdentityFront) {
			await this.createDocumentFromUrl(
				url,
				student,
				DocumentType.PROFESSIONAL_ID,
				result
			);
		}

		// Process professional identity back
		for (const url of documentation.professionalIdentityBack) {
			await this.createDocumentFromUrl(
				url,
				student,
				DocumentType.PROFESSIONAL_ID,
				result
			);
		}

		// Process internship commitment term
		// Process both types of internship commitment terms
		for (const url of documentation.internshipCommitmentTermHSI) {
			await this.createDocumentFromUrl(
				url,
				student,
				DocumentType.COMMITMENT_CONTRACT,
				result
			);
		}
		for (const url of documentation.internshipCommitmentTermHMS) {
			await this.createDocumentFromUrl(
				url,
				student,
				DocumentType.COMMITMENT_CONTRACT,
				result
			);
		}

		// Process city hospital form
		for (const url of documentation.cityHospitalForm) {
			await this.createDocumentFromUrl(
				url,
				student,
				DocumentType.ADMISSION_FORM,
				result
			);
		}

		// Process badge picture
		for (const url of documentation.badgePicture) {
			await this.createDocumentFromUrl(
				url,
				student,
				DocumentType.BADGE_PICTURE,
				result
			);
		}
	}

	private async createDocumentFromUrl(
		url: string,
		student: Student,
		type: DocumentType,
		result: SyncResult
	): Promise<void> {
		try {
			// Extract file ID from Google Drive URL
			const fileId = this.googleSheets.extractFileId(url);

			// Check if document already exists by Google Drive ID
			const existingDoc = await db.document.findOne({
				googleDriveId: fileId,
				student: student.id,
			});

			if (existingDoc) {
				return; // Document already exists
			}

			// Create new document
			const document = new Document(
				`Imported ${type} for ${student.user.name}`,
				type,
				url,
				student,
				`Auto-imported from Google Sheets on ${new Date().toISOString()}`
			);

			// Set Google Drive ID for reference
			document.googleDriveId = fileId;

			await db.em.persist(document);
			result.stats.newDocuments++;
		} catch (error) {
			const errorMsg = `Error creating document from URL ${url}: ${error instanceof Error ? error.message : "Unknown error"}`;
			console.error(errorMsg);
			result.stats.errors.push(errorMsg);
		}
	}

	private generateTemporaryPassword(): string {
		// Generate a random temporary password
		return (
			Math.random().toString(36).slice(-8) +
			Math.random().toString(36).slice(-8)
		);
	}
}
