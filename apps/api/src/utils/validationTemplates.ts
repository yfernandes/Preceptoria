import { DocumentType } from "../entities/document.entity";

export interface ValidationCheck {
	id: string;
	label: string;
	description?: string;
	required: boolean;
}

export interface ValidationTemplate {
	documentType: DocumentType;
	checks: ValidationCheck[];
	instructions?: string;
}

export const validationTemplates: ValidationTemplate[] = [
	{
		documentType: DocumentType.VACCINATION_CARD,
		instructions:
			"Verify that the vaccination card contains all required vaccines. Check each vaccine that is present and legible.",
		checks: [
			{ id: "hasCovidVaccine", label: "COVID-19 Vaccine", required: true },
			{ id: "hasHepatitisB", label: "Hepatitis B Vaccine", required: true },
			{ id: "hasTetanus", label: "Tetanus Vaccine", required: true },
			{ id: "hasDiphtheria", label: "Diphtheria Vaccine", required: true },
			{ id: "hasMeasles", label: "Measles Vaccine", required: true },
			{ id: "hasRubella", label: "Rubella Vaccine", required: true },
			{ id: "hasMumps", label: "Mumps Vaccine", required: true },
			{
				id: "hasVaricella",
				label: "Varicella (Chickenpox) Vaccine",
				required: false,
			},
			{ id: "hasInfluenza", label: "Influenza Vaccine", required: false },
			{
				id: "isLegible",
				label: "Document is legible and readable",
				required: true,
			},
			{
				id: "hasValidDates",
				label: "Vaccination dates are valid and recent",
				required: true,
			},
		],
	},
	{
		documentType: DocumentType.PROFESSIONAL_ID,
		instructions:
			"Verify that the professional ID is valid and contains all required information.",
		checks: [
			{
				id: "hasValidNumber",
				label: "Professional registration number is valid",
				required: true,
			},
			{
				id: "hasValidName",
				label: "Name matches student records",
				required: true,
			},
			{
				id: "hasValidExpiry",
				label: "Registration is not expired",
				required: true,
			},
			{
				id: "isLegible",
				label: "Document is legible and readable",
				required: true,
			},
			{
				id: "hasBothSides",
				label: "Both front and back are provided",
				required: true,
			},
		],
	},
	{
		documentType: DocumentType.COMMITMENT_CONTRACT,
		instructions:
			"Verify that the commitment contract is properly filled and signed.",
		checks: [
			{
				id: "hasStudentSignature",
				label: "Student signature is present",
				required: true,
			},
			{
				id: "hasSupervisorSignature",
				label: "Supervisor signature is present",
				required: true,
			},
			{
				id: "hasValidDates",
				label: "Contract dates are valid",
				required: true,
			},
			{
				id: "hasAllFields",
				label: "All required fields are filled",
				required: true,
			},
			{
				id: "isLegible",
				label: "Document is legible and readable",
				required: true,
			},
		],
	},
	{
		documentType: DocumentType.ADMISSION_FORM,
		instructions: "Verify that the admission form is complete and accurate.",
		checks: [
			{
				id: "hasPersonalInfo",
				label: "Personal information is complete",
				required: true,
			},
			{
				id: "hasContactInfo",
				label: "Contact information is provided",
				required: true,
			},
			{
				id: "hasEmergencyContact",
				label: "Emergency contact is provided",
				required: true,
			},
			{
				id: "hasMedicalInfo",
				label: "Medical information is provided",
				required: true,
			},
			{
				id: "hasStudentSignature",
				label: "Student signature is present",
				required: true,
			},
			{
				id: "isLegible",
				label: "Document is legible and readable",
				required: true,
			},
		],
	},
	{
		documentType: DocumentType.BADGE_PICTURE,
		instructions: "Verify that the badge picture meets the requirements.",
		checks: [
			{
				id: "isRecent",
				label: "Picture is recent (within 6 months)",
				required: true,
			},
			{
				id: "isProfessional",
				label: "Picture is professional and appropriate",
				required: true,
			},
			{
				id: "isClear",
				label: "Picture is clear and high quality",
				required: true,
			},
			{
				id: "hasNeutralBackground",
				label: "Picture has neutral background",
				required: true,
			},
			{
				id: "showsFullFace",
				label: "Picture shows full face clearly",
				required: true,
			},
		],
	},
	{
		documentType: DocumentType.INSURANCE_DOCUMENTATION,
		instructions:
			"Verify that the insurance documentation is valid and covers the internship period.",
		checks: [
			{
				id: "hasValidPolicy",
				label: "Insurance policy number is valid",
				required: true,
			},
			{
				id: "hasValidDates",
				label: "Coverage dates include internship period",
				required: true,
			},
			{
				id: "hasAdequateCoverage",
				label: "Coverage amount is adequate",
				required: true,
			},
			{
				id: "isLegible",
				label: "Document is legible and readable",
				required: true,
			},
		],
	},
	{
		documentType: DocumentType.OTHER,
		instructions:
			"Verify that the document meets the requirements for this category.",
		checks: [
			{
				id: "isRelevant",
				label: "Document is relevant to internship",
				required: true,
			},
			{
				id: "isLegible",
				label: "Document is legible and readable",
				required: true,
			},
			{
				id: "hasValidContent",
				label: "Content is valid and appropriate",
				required: true,
			},
		],
	},
];

export function getValidationTemplate(
	documentType: DocumentType
): ValidationTemplate | undefined {
	return validationTemplates.find(
		(template) => template.documentType === documentType
	);
}

export function getValidationTemplateForDocument(
	documentType: DocumentType
): ValidationTemplate {
	const template = getValidationTemplate(documentType);
	if (!template) {
		// Fallback to OTHER template
		const otherTemplate = validationTemplates.find(
			(t) => t.documentType === DocumentType.OTHER
		);
		if (!otherTemplate) {
			throw new Error("OTHER validation template is missing.");
		}
		return otherTemplate;
	}
	return template;
}
