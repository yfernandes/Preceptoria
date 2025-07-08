import { google } from "googleapis";
import path from "path";

import { Normalize } from "tools/normalizer";
import type { Url } from "types";
import type { ISubmission } from "entities";
// import { fileURLToPath } from "url";
// Equivalent to __filename and __dirname in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

export class GSheets {
	private sheets;
	private credentialsFile: string = path.join(
		__dirname,
		"../../../secrets",
		"service_account.json"
	);

	constructor() {
		const auth = new google.auth.GoogleAuth({
			scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
			keyFile: this.credentialsFile,
		});

		google.options({ auth });
		this.sheets = google.sheets({ version: "v4", auth });
	}
	async getSubmissions(): Promise<ISubmission[]> {
		const raw = await this.sheets.spreadsheets.values.get({
			spreadsheetId: "1gc4rKU34e6KHl34NgpAt-0uZD0gDmEEnOm2-1-o2gt0",
			range: "JoinedForm",
		});

		if (!raw.data.values) {
			console.log("No Data Found");
			return [];
		}

		const submissions = raw.data.values.slice(1).map((entry): ISubmission => {
			return Normalize.all({
				timestamp: entry[0], // A - 0
				fullName: entry[1], // B - 1
				crefito: entry[2], // C - 2
				email: entry[3], // D - 3
				phone: entry[4], // E - 4
				cpf: entry[5], // F - 5
				classNumber: entry[6], // G - 6
				studentsSchoolId: entry[7], // H - 7
				documentation: {
					timestamp: entry[0], // A - 0
					vaccinationCard: this.splitIfDefined(entry[8]), // I - 8
					professionalIdentityFront: this.splitIfDefined(entry[9]), // J - 9
					professionalIdentityBack: this.splitIfDefined(entry[10]), // K - 10
					internshipCommitmentTerm: [
						...this.splitIfDefined(entry[11]),
						...this.splitIfDefined(entry[13]),
					], // L = HSI - 11 || N = HMS - 13
					cityHospitalForm: this.splitIfDefined(entry[14]), // 0 - 14
					badgePicture: entry[15], // P - 15
				},
			});
		});
		return submissions;
	}

	private splitIfDefined(entry: string): Array<Url> {
		return entry !== undefined && entry !== "" ? [...entry.split(", ")] : [];
	}
}
export default GSheets;

// const sheet = new GSheets();
