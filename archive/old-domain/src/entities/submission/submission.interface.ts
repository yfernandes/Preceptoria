import type { Url } from "../../types.js";

// A submission is every entry in a google form.
// It contains basic data and may contain urls

export interface ISubmission {
	timestamp: string;
	crefito: string; // Numero Crefito, Student Id for now
	fullName?: string; // "Nome Completo"
	email?: string; // E-mail
	phone?: string; // Telefone celular

	cpf?: string; // CPF
	classNumber?: string; //	Turma
	studentsSchoolId?: string;
	classSupervisor?: string; // Nome do supervisor, para ser usado quando o app for publico
	documentation: SubmissionDocumentation;
}

export type SubmissionDocumentation = {
	timestamp: string;

	// Student Provided Documents
	vaccinationCard: Array<Url>; //	Cartão de vacina
	professionalIdentityFront: Array<Url>; // Identidade do Conselho de Trabalho
	professionalIdentityBack: Array<Url>; // Identidade do Conselho de Trabalho
	badgePicture?: Url;

	// Hospital Provided documents
	cityHospitalForm: Array<Url>; // Cadastro Hospital Municipal de Salvador
	internshipCommitmentTerm: Array<Url>; // Termo de Compromisso de Estágio
	insurance?: Url;
};
