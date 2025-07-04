import type { IDocument } from "../document/document.interface.js";

// A Documentation is a submission documentation with all its metadata
export interface IDocumentation {
	timestamp: string;

	// Student Provided Documents
	vaccinationCard?: Array<IDocument>; //	Cartão de vacina
	professionalIdentityFront?: Array<IDocument>; // Identidade do Conselho de Trabalho
	professionalIdentityBack?: Array<IDocument>; // Identidade do Conselho de Trabalho
	badgePicture?: IDocument;

	// Hospital Provided documents
	cityHospitalForm?: Array<IDocument>; // Cadastro Hospital Municipal de Salvador
	internshipCommitmentTerm?: Array<IDocument>; // Termo de Compromisso de Estágio
	insurance?: IDocument;
}
