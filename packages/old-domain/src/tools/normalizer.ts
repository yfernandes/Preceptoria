import type { ISubmission } from "entities";
import type { SourceId, Url } from "types";

export class Normalize {
	static all(studentData: ISubmission): ISubmission {
		const docs = studentData.documentation;
		return {
			...studentData,
			fullName: this.name(studentData.fullName),
			phone: this.phone(studentData.phone),
			cpf: this.cpf(studentData.cpf),
			crefito: this.crefito(studentData.crefito),
			email: this.email(studentData.email),
			documentation: {
				...studentData.documentation,
				cityHospitalForm:
					docs.cityHospitalForm.length > 0
						? docs.cityHospitalForm.map(this.extractFileId)
						: [],
				vaccinationCard:
					docs.vaccinationCard.length > 0
						? docs.vaccinationCard.map(this.extractFileId)
						: [],
				professionalIdentityFront:
					docs.professionalIdentityFront.length > 0
						? docs.professionalIdentityFront.map(this.extractFileId)
						: [],
				professionalIdentityBack:
					docs.professionalIdentityBack.length > 0
						? docs.professionalIdentityBack.map(this.extractFileId)
						: [],
				internshipCommitmentTerm:
					docs.internshipCommitmentTerm.length > 0
						? docs.internshipCommitmentTerm.map(this.extractFileId)
						: [],
				badgePicture: docs.badgePicture
					? this.extractFileId(docs.badgePicture)
					: undefined,
			},
		};
	}

	static extractFileId(url: Url): SourceId {
		const regex = /[-\w]{25,}/;
		const match = url.match(regex);
		if (!match) {
			throw new Error(`Invalid Google Drive URL: ${url}..`);
		}
		return match[0];
	}

	static titleCase(str: string) {
		return str
			.toLowerCase()
			.split(" ")
			.map(function (word) {
				return word.charAt(0).toUpperCase() + word.slice(1);
			})
			.join(" ");
	}

	static name(name?: string): string | undefined {
		if (name === undefined) return name;
		return this.titleCase(name);
		// return name.trim().replace(/\b\w/g, (c: string) => c.toUpperCase());
	}

	static email(email?: string): string | undefined {
		if (email === undefined) {
			return undefined;
		}
		return email.trim().toLowerCase();
	}
	static phone(phone?: string): string | undefined {
		if (phone === undefined) {
			return undefined;
		}
		phone = phone.replace(/\D/g, "");
		if (phone.length === 11) {
			return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
		} else {
			return phone;
		}
	}

	static cpf(cpf?: string): string | undefined {
		if (cpf === undefined) {
			return undefined;
		}
		cpf = cpf.replace(/\D/g, "");
		return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(
			6,
			9
		)}-${cpf.slice(9)}`;
	}

	static crefito(crefito: string): string {
		crefito = crefito.replace(/\D/g, "");
		return `${crefito}-F`;
	}
}
