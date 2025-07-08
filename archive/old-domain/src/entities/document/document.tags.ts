export const enum VaccineTags {
	FirstDoseHepB = "Hepatitis B - First Dose",
	SecondDoseHepB = "Hepatitis B - Second Dose",
	ThirdDoseHepB = "Hepatitis B - Third Dose",
	FirstDoseCovid = "Covid - First Dose",
	SecondDoseCovid = "Covid - Second Dose",
	UpToDateDT = "DT - Up To Date",
	FirstPage = "First Page",
}

export const enum ProfessionalIdentityTags {
	FrontPage = "Front Page",
	BackPage = "Back Page",
}

export const enum BadgeTags {
	IsFromShoulderUp = "Is from shoulder up",
	HasNoHatsOrSunglasses = "Has no hats or sunglasses",
	HasNoDistractingElements = "Has no distracting elements",
	IsClear = "Is clear",
}

export const enum CityHospitalFormTags {
	AllFieldsFilled = "All fields filled",
	Signed = "Signed",
}

export const enum InternshipCommitmentTermTags {
	HasFullNameOnFirstPage = "Has full name on first page",
	IsDatedOnSecondPage = "Is dated on second page",
	Signed = "Signed",
}

export const enum InsuranceTags {
	MatchedName = "Matched name",
}

export const enum ScannedDocumentsTags {
	InFocus = "In focus",
	Legible = "Legible",
	Clear = "Clear",
	InFrame = "In frame",
	NotTilted = "Not tilted",
	NoWatermarks = "No Watermarks",
	NoFilters = "No filters",
	ApproveAnyway = "Approve anyway",
}

export const enum GeneralTags {
	OutOfDate = "Out of date",
	Deny = "Deny",
}

export type DocumentTag =
	| VaccineTags
	| ProfessionalIdentityTags
	| BadgeTags
	| CityHospitalFormTags
	| InternshipCommitmentTermTags
	| InsuranceTags
	| ScannedDocumentsTags
	| GeneralTags;
