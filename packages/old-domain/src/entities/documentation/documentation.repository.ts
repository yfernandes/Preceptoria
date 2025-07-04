import { EntityRepository } from "@mikro-orm/sqlite";
import { Documentation } from "./documentation.entity.js";
import { Student } from "../student/student.entity.js";
import { Submission } from "../submission/submission.entity.js";
import { Document } from "../document/document.entity.js";
import { DocumentType } from "../document/document.interface.js";

export class DocumentationRepository extends EntityRepository<Documentation> {
	static createDocumentationFromSubmission(
		student: Student,
		submission: Submission
	): Documentation {
		// Create a new documentation based on the submission
		const documentation = new Documentation(
			submission.timestamp,
			student.documentations.length
		);

		// Initialize the documents and add them to the documentation
		const entryIndex = student.documentations.length;
		const crefito = student.crefito;

		// Create documents from the submission
		const documents = [
			// Vaccination Card
			...submission.documentation.vaccinationCard.map((doc, i) =>
				Document.CreateDocumentFromSourceId(
					doc,
					DocumentType.vaccinationCard,
					i,
					entryIndex,
					crefito
				)
			),

			// Professional Identity Front
			...submission.documentation.professionalIdentityFront.map((doc, i) =>
				Document.CreateDocumentFromSourceId(
					doc,
					DocumentType.professionalIdentityFront,
					i,
					entryIndex,
					crefito
				)
			),

			// Professional Identity Back
			...submission.documentation.professionalIdentityBack.map((doc, i) =>
				Document.CreateDocumentFromSourceId(
					doc,
					DocumentType.professionalIdentityBack,
					i,
					entryIndex,
					crefito
				)
			),

			// Badge Picture (optional)
			submission.documentation.badgePicture
				? Document.CreateDocumentFromSourceId(
						submission.documentation.badgePicture,
						DocumentType.badgePicture,
						0,
						entryIndex,
						crefito
				  )
				: undefined,

			// Internship Commitment Term
			...submission.documentation.internshipCommitmentTerm.map((doc, i) =>
				Document.CreateDocumentFromSourceId(
					doc,
					DocumentType.internshipCommitmentTerm,
					i,
					entryIndex,
					crefito
				)
			),

			// City Hospital Form
			...submission.documentation.cityHospitalForm.map((doc, i) =>
				Document.CreateDocumentFromSourceId(
					doc,
					DocumentType.cityHospitalForm,
					i,
					entryIndex,
					crefito
				)
			),

			// Insurance (optional)
			submission.documentation.insurance
				? Document.CreateDocumentFromSourceId(
						submission.documentation.insurance,
						DocumentType.insurance,
						0,
						entryIndex,
						crefito
				  )
				: undefined,
		].filter((doc): doc is Document => doc !== undefined); // Filter out undefined
		// Apply documents to the Documentation entity
		documentation.includeDocuments(documents);

		return documentation;
	}
}
