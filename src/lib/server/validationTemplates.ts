export enum DocumentType {
	PROFESSIONAL_ID = "PROFESSIONAL_ID",
	VACCINATION_CARD = "VACCINATION_CARD",
	COMMITMENT_CONTRACT = "COMMITMENT_CONTRACT",
	ADMISSION_FORM = "ADMISSION_FORM",
	BADGE_PICTURE = "BADGE_PICTURE",
	INSURANCE_DOCUMENTATION = "INSURANCE_DOCUMENTATION",
	OTHER = "OTHER",
}

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
			{ id: "isLegible", label: "Document is legible", required: true },
		],
	},
	{
		documentType: DocumentType.PROFESSIONAL_ID,
		instructions: "Verify that the professional ID is valid and legible.",
		checks: [
			{
				id: "hasValidNumber",
				label: "Registration number is valid",
				required: true,
			},
			{ id: "hasValidName", label: "Name matches student", required: true },
			{ id: "isLegible", label: "Document is legible", required: true },
		],
	},
	// ... other templates simplified or just brought over
];

export function getValidationTemplateForDocument(type: string): ValidationTemplate {
	const template = validationTemplates.find((t) => t.documentType === type);
	if (!template) {
		return {
			documentType: DocumentType.OTHER,
			instructions: "Check document for general requirements.",
			checks: [{ id: "isRelevant", label: "Is relevant", required: true }],
		};
	}
	return template;
}
