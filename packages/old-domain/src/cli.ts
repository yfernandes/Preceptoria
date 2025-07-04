import { initOrm } from "db";
import {
	matchInsuranceFilesToStudents,
	downloadFiles,
	spreadsheetSync,
	preProcessing,
	postProcessing,
	// approveDocs,
} from "tools";
import { PROJECT_ROOT } from "./types.js";
import { select, Separator } from "@inquirer/prompts";

console.log(PROJECT_ROOT);
const DRY_RUN = false;

async function main() {
	try {
		// Configure Services
		const db = await initOrm();
		await db.student.findAll();

		console.clear();
		let keepRunning = true;

		while (keepRunning) {
			const answer = await select<string>({
				message: "What do you want to run?",
				loop: true,
				choices: [
					{
						name: "Sync",
						value: "sync",
						description: "Syncs with Google Sheets and updates DB",
					},
					{
						name: "Insurance",
						value: "insurance",
						description: "Searches for insurances files and adds them to DB",
					},
					{
						name: "Pre Processing",
						value: "preProcessing",
						description: "Extracts images from PDFs and compresses files",
						disabled: "(Not implemented yet)",
					},
					{
						name: "Download",
						value: "download",
						description: "Downloads files from Google Drive",
					},
					{
						name: "Approval Process",
						value: "approval",
						description: "Go through each document and evaluate it",
					},
					{
						name: "Post Processing",
						value: "postProcessing",
						description:
							"Compiles approved documents, and creates upload bundles",
					},
					new Separator(),
					{
						name: "Exit",
						value: "exit",
						description: "Exit the application",
					},
				],
			});

			switch (answer) {
				case "sync":
					console.log("Syncing with Google Sheets...");
					if (!DRY_RUN) await spreadsheetSync(db);
					break;
				case "insurance":
					console.log("Matching insurance files to students...");
					if (!DRY_RUN) await matchInsuranceFilesToStudents(db);
					break;
				case "preProcessing":
					console.log("Running pre-processing tasks...");
					if (!DRY_RUN) await preProcessing();
					break;
				case "download":
					console.log("Downloading files...");
					if (!DRY_RUN) await downloadFiles(db);
					break;
				// case "approval":
				// 	console.log("Running approve tasks...");
				// 	if (!DRY_RUN) await approveDocs();
				// 	break;
				case "postProcessing":
					console.log("Running post-processing tasks...");
					if (!DRY_RUN) await postProcessing(db);
					break;
				case "exit":
					console.log("Exiting...");
					keepRunning = false;
					break;
				default:
					console.error("Invalid choice");
					break;
			}

			if (keepRunning) {
				// ------------------- Wrap Up -------------------
				console.log("Task completed successfully.");
			}
		}
	} catch (error) {
		console.error("Error in main process:", error);
	} finally {
		process.exit();
	}
}

await main();
