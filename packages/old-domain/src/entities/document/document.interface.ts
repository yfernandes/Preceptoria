import type { SourceId } from "../../types.js";

export interface IDocument {
	// Metadata
	sourceId: SourceId; // Sanitized id from Source Url
	srcName?: string; // Original file name
	mimeType?: string; // File Type from src
	extension?: string; // Derived from mimeType

	// Internal
	fileName: string; // Based on document type and documentation index
	destPath: string;
	downloadStatus: DownloadStatus;
	approvalStatus: ApprovalStatus;
	documentType: DocumentType;
}

export enum DownloadStatus {
	Downloaded = "Downloaded",
	NotDownloaded = "Not Downloaded",
	Error = "Error",
}

export enum ApprovalStatus {
	NotReviewed = "Not Reviewed",
	Denied = "Denied",
	Approved = "Approved",
}

export enum DocumentType {
	vaccinationCard = "vaccinationCard",
	professionalIdentityFront = "professionalIdentityFront",
	professionalIdentityBack = "professionalIdentityBack",
	badgePicture = "badgePicture",
	cityHospitalForm = "cityHospitalForm",
	internshipCommitmentTerm = "InternshipCommitmentTerm",
	insurance = "insurance",
}
