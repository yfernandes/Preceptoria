import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";

// Equivalent to __filename and __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface GoogleSheetsSubmission {
	timestamp: string;
	fullName: string;
	crefito: string;
	email: string;
	phone: string;
	cpf: string;
	classNumber: string;
	studentsSchoolId: string;
	documentation: {
		timestamp: string;
		vaccinationCard: string[];
		professionalIdentityFront: string[];
		professionalIdentityBack: string[];
		internshipCommitmentTermHSI: string[]; // Termo de Compromisso de Estágio - HSI
		internshipCommitmentTermHMS: string[]; // Termo de Compromisso de Estágio (HMS)
		cityHospitalForm: string[]; // Cadastro Hospital Municipal de Salvador
		badgePicture: string[];
	};
}

export interface ConsolidatedSubmission {
	// This is the canonical professional identity number (Crefito). Must always be present and unique.
	crefito: string;
	// Basic info (from first complete entry)
	fullName: string;
	email: string;
	phone: string;
	cpf: string;
	classNumber: string;
	studentsSchoolId: string;
	// Consolidated documentation from all entries
	documentation: {
		vaccinationCard: string[];
		professionalIdentityFront: string[];
		professionalIdentityBack: string[];
		internshipCommitmentTermHSI: string[];
		internshipCommitmentTermHMS: string[];
		cityHospitalForm: string[];
		badgePicture: string[];
	};
	// Track which entries contributed
	entryCount: number;
	hasCompleteBasicInfo: boolean;
}

export class GoogleSheetsService {
	private sheets;
	private credentialsFile: string;

	constructor() {
		this.credentialsFile = path.join(
			__dirname,
			"../../secrets/service_account.json"
		);

		const auth = new google.auth.GoogleAuth({
			scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
			keyFile: this.credentialsFile,
		});

		google.options({ auth });
		this.sheets = google.sheets({ version: "v4", auth });
	}

	async getSubmissions(
		spreadsheetId: string,
		range = "JoinedForm"
	): Promise<GoogleSheetsSubmission[]> {
		try {
			const raw = await this.sheets.spreadsheets.values.get({
				spreadsheetId,
				range,
			});

			if (!raw.data.values) {
				console.log("No data found in Google Sheets");
				return [];
			}

			// Skip header row and map to our format
			// Header: Timestamp | Nome Completo | Crefito | Email | Telefone Celular | CPF | Turma | Número de Cadastro da Pós Graduação | Cartão de Vacinação | Carteira de Identidade Profissional - Frente | Carteira de Identidade Profissional - Verso | Termo de Compromisso de Estágio - HSI | | Termo de Compromisso de Estágio | Cadastro Hospital Municipal de Salvador | Foto Crachá
			const submissions = raw.data.values
				.slice(1)
				.map((entry): GoogleSheetsSubmission => {
					return {
						timestamp: entry[0] || "", // A - 0: Timestamp
						fullName: entry[1] || "", // B - 1: Nome Completo
						crefito: entry[2] || "", // C - 2: Crefito
						email: entry[3] || "", // D - 3: Email
						phone: entry[4] || "", // E - 4: Telefone Celular
						cpf: entry[5] || "", // F - 5: CPF
						classNumber: entry[6] || "", // G - 6: Turma
						studentsSchoolId: entry[7] || "", // H - 7: Número de Cadastro da Pós Graduação
						documentation: {
							timestamp: entry[0] || "", // A - 0: Timestamp
							vaccinationCard: this.splitIfDefined(entry[8]), // I - 8: Cartão de Vacinação
							professionalIdentityFront: this.splitIfDefined(entry[9]), // J - 9: Carteira de Identidade Profissional - Frente
							professionalIdentityBack: this.splitIfDefined(entry[10]), // K - 10: Carteira de Identidade Profissional - Verso
							internshipCommitmentTermHSI: this.splitIfDefined(entry[11]), // L - 11: Termo de Compromisso de Estágio - HSI
							internshipCommitmentTermHMS: this.splitIfDefined(entry[13]), // N - 13: Termo de Compromisso de Estágio (HMS)
							cityHospitalForm: this.splitIfDefined(entry[14]), // O - 14: Cadastro Hospital Municipal de Salvador
							badgePicture: this.splitIfDefined(entry[15]), // P - 15: Foto Crachá
						},
					};
				});

			console.log(
				`Fetched ${submissions.length} submissions from Google Sheets`
			);

			// Debug: Show a sample submission structure
			if (submissions.length > 0) {
				console.log("📊 Sample submission structure:");
				const sample = submissions[0];
				console.log(`  - Full Name: ${sample.fullName}`);
				console.log(`  - Email: ${sample.email}`);
				console.log(`  - Class: ${sample.classNumber}`);
				console.log(`  - Vaccination Cards: ${sample.documentation.vaccinationCard.length} files`);
				console.log(`  - Identity Front: ${sample.documentation.professionalIdentityFront.length} files`);
				console.log(`  - Identity Back: ${sample.documentation.professionalIdentityBack.length} files`);
				console.log(`  - HSI Commitments: ${sample.documentation.internshipCommitmentTermHSI.length} files`);
				console.log(`  - HMS Commitments: ${sample.documentation.internshipCommitmentTermHMS.length} files`);
				console.log(`  - Hospital Forms: ${sample.documentation.cityHospitalForm.length} files`);
				console.log(`  - Badge Pictures: ${sample.documentation.badgePicture.length} files`);
			}

			return submissions;
		} catch (error) {
			console.error("Error fetching submissions from Google Sheets:", error);
			throw new Error(
				`Failed to fetch submissions: ${error instanceof Error ? error.message : "Unknown error"}`
			);
		}
	}

	consolidateSubmissionsByCrefito(submissions: GoogleSheetsSubmission[]): ConsolidatedSubmission[] {
		console.log("🔄 Consolidating submissions by Crefito...");
		
		// Group submissions by Crefito
		const crefitoGroups = new Map<string, GoogleSheetsSubmission[]>();
		
		for (const submission of submissions) {
			if (!submission.crefito) {
				console.log(`⚠️ Skipping submission without Crefito: ${submission.fullName || 'Unknown'}`);
				continue;
			}
			
			if (!crefitoGroups.has(submission.crefito)) {
				crefitoGroups.set(submission.crefito, []);
			}
			crefitoGroups.get(submission.crefito)!.push(submission);
		}
		
		console.log(`📊 Found ${crefitoGroups.size} unique Crefito numbers`);
		
		const consolidated: ConsolidatedSubmission[] = [];
		
		for (const [crefito, group] of crefitoGroups) {
			// Sort group by completeness (most complete first)
			group.sort((a, b) => {
				const aScore = this.getCompletenessScore(a);
				const bScore = this.getCompletenessScore(b);
				return bScore - aScore; // Descending order
			});
			
			const primaryEntry = this.fillMissingData(group[0]);
			const hasCompleteBasicInfo = this.hasCompleteBasicInfo(primaryEntry);

            // Runtime assertion: crefito must always be present
            if (!crefito) {
                throw new Error("[Consolidation Error] Missing crefito in consolidated entry. This should never happen.");
            }
			
			// Consolidate documentation from all entries
			const consolidatedDocs = {
				vaccinationCard: [] as string[],
				professionalIdentityFront: [] as string[],
				professionalIdentityBack: [] as string[],
				internshipCommitmentTermHSI: [] as string[],
				internshipCommitmentTermHMS: [] as string[],
				cityHospitalForm: [] as string[],
				badgePicture: [] as string[],
			};
			
			// Merge all documentation from all entries
			for (const entry of group) {
				consolidatedDocs.vaccinationCard.push(...entry.documentation.vaccinationCard);
				consolidatedDocs.professionalIdentityFront.push(...entry.documentation.professionalIdentityFront);
				consolidatedDocs.professionalIdentityBack.push(...entry.documentation.professionalIdentityBack);
				consolidatedDocs.internshipCommitmentTermHSI.push(...entry.documentation.internshipCommitmentTermHSI);
				consolidatedDocs.internshipCommitmentTermHMS.push(...entry.documentation.internshipCommitmentTermHMS);
				consolidatedDocs.cityHospitalForm.push(...entry.documentation.cityHospitalForm);
				consolidatedDocs.badgePicture.push(...entry.documentation.badgePicture);
			}
			
			// Remove duplicates from arrays
			Object.keys(consolidatedDocs).forEach(key => {
				const k = key as keyof typeof consolidatedDocs;
				consolidatedDocs[k] = [...new Set(consolidatedDocs[k])];
			});
			
			consolidated.push({
				crefito,
				fullName: primaryEntry.fullName,
				email: primaryEntry.email,
				phone: primaryEntry.phone,
				cpf: primaryEntry.cpf,
				classNumber: primaryEntry.classNumber,
				studentsSchoolId: primaryEntry.studentsSchoolId,
				documentation: consolidatedDocs,
				entryCount: group.length,
				hasCompleteBasicInfo,
			});
		}
		
		console.log(`✅ Consolidated into ${consolidated.length} unique students`);
		console.log(`📊 Consolidation stats:`);
		console.log(`  - Students with complete info: ${consolidated.filter(c => c.hasCompleteBasicInfo).length}`);
		console.log(`  - Students with incomplete info: ${consolidated.filter(c => !c.hasCompleteBasicInfo).length}`);
		console.log(`  - Average entries per student: ${(submissions.length / consolidated.length).toFixed(1)}`);
		
		return consolidated;
	}
	
	private getCompletenessScore(submission: GoogleSheetsSubmission): number {
		let score = 0;
		if (submission.fullName) score += 10;
		if (submission.email) score += 10;
		if (submission.phone) score += 5;
		if (submission.cpf) score += 5;
		if (submission.classNumber) score += 5;
		if (submission.studentsSchoolId) score += 5;
		
		// Bonus for having documentation
		const docCount = 
			submission.documentation.vaccinationCard.length +
			submission.documentation.professionalIdentityFront.length +
			submission.documentation.professionalIdentityBack.length +
			submission.documentation.internshipCommitmentTermHSI.length +
			submission.documentation.internshipCommitmentTermHMS.length +
			submission.documentation.cityHospitalForm.length +
			submission.documentation.badgePicture.length;
		
		score += Math.min(docCount * 2, 20); // Cap at 20 points for docs
		
		return score;
	}
	
	private hasCompleteBasicInfo(submission: GoogleSheetsSubmission): boolean {
		return !!(submission.fullName && submission.email && submission.phone);
	}

	private fillMissingData(submission: GoogleSheetsSubmission): GoogleSheetsSubmission {
		return {
			...submission,
			fullName: submission.fullName || "Not submitted",
			email: submission.email || "not.submitted@placeholder.com",
			phone: this.cleanPhoneNumber(submission.phone) || "+55 (99) 99999-9999",
			cpf: submission.cpf || "000.000.000-00",
			classNumber: submission.classNumber || "Not submitted",
			studentsSchoolId: submission.studentsSchoolId || "Not submitted",
		};
	}

	private cleanPhoneNumber(phone: string): string {
		if (!phone || phone.trim() === "") {
			return "";
		}

		// Remove all non-digit characters except +
		let cleaned = phone.replace(/[^\d+]/g, "");
		
		// If it starts with 55, add the +
		if (cleaned.startsWith("55") && !cleaned.startsWith("+55")) {
			cleaned = "+" + cleaned;
		}
		
		// If it doesn't start with +55, add it (assuming Brazilian numbers)
		if (!cleaned.startsWith("+55")) {
			cleaned = "+55" + cleaned;
		}
		
		// Format as Brazilian phone number: +55 (XX) XXXXX-XXXX
		if (cleaned.length === 13) { // +55 + 11 digits
			const ddd = cleaned.substring(3, 5);
			const number = cleaned.substring(5);
			return `+55 (${ddd}) ${number.substring(0, 5)}-${number.substring(5)}`;
		}
		
		// If we can't format it properly, return the cleaned version
		return cleaned;
	}

	static isPlaceholder(value: string, field: 'email' | 'phone' | 'name' | 'cpf'): boolean {
		const placeholders = {
			email: "not.submitted@placeholder.com",
			phone: "+55 (99) 99999-9999",
			name: "Not submitted",
			cpf: "000.000.000-00"
		};
		return value === placeholders[field];
	}

	private splitIfDefined(entry: string): string[] {
		if (!entry || entry === "") {
			return [];
		}
		
		// Handle multiple separators that might be used
		const separators = [", ", "; ", "\n", " | "];
		let urls = [entry];
		
		for (const separator of separators) {
			urls = urls.flatMap(url => url.split(separator));
		}
		
		// Clean up URLs and filter out empty ones
		return urls
			.map(url => url.trim())
			.filter(url => url.length > 0 && url.includes("drive.google.com"));
	}

	extractFileId(url: string): string {
		const regex = /[-\w]{25,}/;
		const match = regex.exec(url);
		if (!match) {
			throw new Error(`Invalid Google Drive URL: ${url}`);
		}
		return match[0];
	}
}
