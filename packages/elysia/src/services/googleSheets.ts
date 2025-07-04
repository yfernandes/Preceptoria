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
		internshipCommitmentTerm: string[];
		cityHospitalForm: string[];
		badgePicture: string;
	};
}

export class GoogleSheetsService {
	private sheets;
	private credentialsFile: string;

	constructor() {
		this.credentialsFile = path.join(
			__dirname,
			"../../../secrets/service_account.json"
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
			const submissions = raw.data.values
				.slice(1)
				.map((entry): GoogleSheetsSubmission => {
					return {
						timestamp: entry[0] || "", // A - 0
						fullName: entry[1] || "", // B - 1
						crefito: entry[2] || "", // C - 2
						email: entry[3] || "", // D - 3
						phone: entry[4] || "", // E - 4
						cpf: entry[5] || "", // F - 5
						classNumber: entry[6] || "", // G - 6
						studentsSchoolId: entry[7] || "", // H - 7
						documentation: {
							timestamp: entry[0] || "", // A - 0
							vaccinationCard: this.splitIfDefined(entry[8]), // I - 8
							professionalIdentityFront: this.splitIfDefined(entry[9]), // J - 9
							professionalIdentityBack: this.splitIfDefined(entry[10]), // K - 10
							internshipCommitmentTerm: [
								...this.splitIfDefined(entry[11]),
								...this.splitIfDefined(entry[13]),
							], // L = HSI - 11 || N = HMS - 13
							cityHospitalForm: this.splitIfDefined(entry[14]), // O - 14
							badgePicture: entry[15] || "", // P - 15
						},
					};
				});

			console.log(
				`Fetched ${submissions.length} submissions from Google Sheets`
			);
			return submissions;
		} catch (error) {
			console.error("Error fetching submissions from Google Sheets:", error);
			throw new Error(
				`Failed to fetch submissions: ${error instanceof Error ? error.message : "Unknown error"}`
			);
		}
	}

	private splitIfDefined(entry: string): string[] {
		return entry !== undefined && entry !== "" ? entry.split(", ") : [];
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
