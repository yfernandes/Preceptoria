import { EntityRepository } from "@mikro-orm/sqlite";
import { Submission } from "./submission.entity.js";
import { type ISubmission } from "./submission.interface.js";

export class SubmissionRepository extends EntityRepository<Submission> {
	async createIfNotFound(submissionData: ISubmission) {
		const exists = await this.find({
			timestamp: submissionData.timestamp,
			crefito: submissionData.crefito,
		});

		if (exists.length > 0) {
			console.log("Found existing entry, skipping...");
			return;
		} else {
			const submission = new Submission(submissionData);

			return await this.em.persistAndFlush(submission);
		}
	}

	async createAllIfNotFound(submissions: ISubmission[]) {
		submissions.forEach(async (submission, i) => {
			console.log(
				`---- Processing entry for: ${submission.crefito} (${i + 1}/${
					submissions.length
				})`
			);
			await this.createIfNotFound(submission);
			console.log("------------ Entry End -------------\n");
		});
	}
}
