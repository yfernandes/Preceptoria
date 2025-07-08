import { mergePdfAndImages } from "tools";
import { ApprovalStatus, Student } from "entities";
import { type Services } from "db";
import {
	BadgeTags,
	CityHospitalFormTags,
	InternshipCommitmentTermTags,
	ProfessionalIdentityTags,
	VaccineTags,
	type DocumentTag,
} from "entities/document/document.tags";
import { Document, DocumentType } from "entities";
// import { $ } from "bun";
// await $`rm -rf ./**/*\ \-\ Completo.pdf`.nothrow();

export async function compileDocumentation(db: Services): Promise<void> {
	console.clear();
	console.log("\n\n\n\n\n------------------------------------------------");
	// await $`rm -rf ./**/*\ \-\ Completo.pdf`.nothrow();

	// List of all students with their documentations
	const allStudents: Student[] = await db.student.findAll({
		populate: ["insurance"],
	});

	for (const [studentIndex, student] of allStudents.entries()) {
		console.log(student.crefito);
		// Requirements list for student approval
		const badgeRequirements: DocumentTag[] = [
			BadgeTags.IsFromShoulderUp,
			BadgeTags.HasNoHatsOrSunglasses,
			BadgeTags.HasNoDistractingElements,
			BadgeTags.IsClear,
		];

		const vaccineRequirements: DocumentTag[] = [
			VaccineTags.FirstDoseHepB,
			VaccineTags.SecondDoseHepB,
			VaccineTags.ThirdDoseHepB,
			VaccineTags.FirstDoseCovid,
			VaccineTags.SecondDoseCovid,
			VaccineTags.UpToDateDT,
		];

		const crefitoRequirements: DocumentTag[] = [
			ProfessionalIdentityTags.FrontPage,
			ProfessionalIdentityTags.BackPage,
		];

		const hospitalFormRequirements: DocumentTag[] = [
			CityHospitalFormTags.AllFieldsFilled,
			CityHospitalFormTags.Signed,
		];

		const commitmentTermRequirements: DocumentTag[] = [
			InternshipCommitmentTermTags.HasFullNameOnFirstPage,
			InternshipCommitmentTermTags.IsDatedOnSecondPage,
			InternshipCommitmentTermTags.Signed,
		];
		// Get all approved documents for the student
		const documents: Document[] = await db.document.findAll({
			populate: ["documentation.student.id"],
			where: {
				documentation: { student: { id: student.id } },
				approvalStatus: ApprovalStatus.Approved,
			},
		});
		// console.log(
		// 	`Creating list of approved documents for Crefito: ${student.crefito}`
		// );

		function checkRequirements(
			document: Document,
			requirements: DocumentTag[]
		) {
			document.tags.forEach((tag) => {
				// Is this document tag present in the requirements list?
				if (requirements.includes(tag)) {
					// Remove it from the requirements list
					requirements = requirements.filter(
						(requirement) => requirement !== tag
					);
					// Add it to the approved list
					if (!approved.includes(document)) {
						approved.push(document);
					}
				}
			});
		}

		const approved: Document[] = [];
		for (const document of documents) {
			switch (document.documentType) {
				case DocumentType.badgePicture: {
					checkRequirements(document, badgeRequirements);
					break;
				}
				case DocumentType.vaccinationCard: {
					checkRequirements(document, vaccineRequirements);
					break;
				}
				case DocumentType.cityHospitalForm: {
					checkRequirements(document, hospitalFormRequirements);
					break;
				}
				case DocumentType.internshipCommitmentTerm: {
					checkRequirements(document, commitmentTermRequirements);
					break;
				}
				case DocumentType.professionalIdentityFront:
				case DocumentType.professionalIdentityBack: {
					checkRequirements(document, crefitoRequirements);
					break;
				}
				default: {
					break;
				}
			}
		}

		if (student.insurance) {
			console.log(
				`Student Has Insurance: ${student.insurance.destPath + "/" + student.insurance.fileName + ".pdf"}`
			);
			approved.push(student.insurance);
		}
		await mergePdfAndImages(approved, student.crefito).then(() => {
			console.log(
				`----------------- Done ${studentIndex + 1}/${allStudents.length} -----------------\n`
			);
		});
	}
}
