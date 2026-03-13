import type { ISubmission } from "entities"
import type { SourceId, Url } from "types"

export class Normalize {
	static all(studentData: ISubmission): ISubmission {
		const docs = studentData.documentation
		return {
			...studentData,
			fullName: Normalize.name(studentData.fullName),
			phone: Normalize.phone(studentData.phone),
			cpf: Normalize.cpf(studentData.cpf),
			crefito: Normalize.crefito(studentData.crefito),
			email: Normalize.email(studentData.email),
			documentation: {
				...studentData.documentation,
				cityHospitalForm:
					docs.cityHospitalForm.length > 0
						? docs.cityHospitalForm.map(Normalize.extractFileId)
						: [],
				vaccinationCard:
					docs.vaccinationCard.length > 0 ? docs.vaccinationCard.map(Normalize.extractFileId) : [],
				professionalIdentityFront:
					docs.professionalIdentityFront.length > 0
						? docs.professionalIdentityFront.map(Normalize.extractFileId)
						: [],
				professionalIdentityBack:
					docs.professionalIdentityBack.length > 0
						? docs.professionalIdentityBack.map(Normalize.extractFileId)
						: [],
				internshipCommitmentTerm:
					docs.internshipCommitmentTerm.length > 0
						? docs.internshipCommitmentTerm.map(Normalize.extractFileId)
						: [],
				badgePicture: docs.badgePicture ? Normalize.extractFileId(docs.badgePicture) : undefined,
			},
		}
	}

	static extractFileId(url: Url): SourceId {
		const regex = /[-\w]{25,}/
		const match = url.match(regex)
		if (!match) {
			throw new Error(`Invalid Google Drive URL: ${url}..`)
		}
		return match[0]
	}

	static titleCase(str: string) {
		return str
			.toLowerCase()
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ")
	}

	static name(name?: string): string | undefined {
		if (name === undefined) return name
		return Normalize.titleCase(name)
		// return name.trim().replace(/\b\w/g, (c: string) => c.toUpperCase());
	}

	static email(email?: string): string | undefined {
		if (email === undefined) {
			return undefined
		}
		return email.trim().toLowerCase()
	}
	static phone(phone?: string): string | undefined {
		if (phone === undefined) {
			return undefined
		}
		phone = phone.replace(/\D/g, "")
		if (phone.length === 11) {
			return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`
		} else {
			return phone
		}
	}

	static cpf(cpf?: string): string | undefined {
		if (cpf === undefined) {
			return undefined
		}
		cpf = cpf.replace(/\D/g, "")
		return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`
	}

	static crefito(crefito: string): string {
		crefito = crefito.replace(/\D/g, "")
		return `${crefito}-F`
	}
}
