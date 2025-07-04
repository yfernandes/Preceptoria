import { EntityRepository } from "@mikro-orm/sqlite";

import { Student } from "./student.entity";
import { Submission } from "../submission/submission.entity.js";
import { DocumentationRepository } from "../documentation/documentation.repository.js";
import { PROJECT_ROOT } from "../../types.js";

export class StudentRepository extends EntityRepository<Student> {
	async getAllStudents(): Promise<Array<Student>> {
		console.log("Repo: Got called");
		return this.findAll({
			populate: ["documentations.id"],
			limit: 50,
		});
	}

	async update(studentData: Partial<Student>): Promise<Student> {
		return await this.upsert({
			...studentData,
		});
	}

	// Create a new student if it doesn't exist at all,
	// otherwise check if the submission already exists
	// If it does, do nothing
	// If it doesn't, add it
	async checkExistingStudent(submission: Submission) {
		console
			.log
			// `Checking if student with crefito ${submission.crefito} exists...`
			();
		const existingStudent = await this.findOne(
			{
				crefito: submission.crefito,
			},
			{
				populate: ["documentations"],
			}
		);
		// If the student exists, check if the submission also already exists
		if (existingStudent) {
			// Check if the submission already exists
			// console.log(
			// 	`-- Checking if documentation with timestamp ${submission.timestamp} already exists for user with crefito ${existingStudent.crefito}`
			// );
			const existingSubmission = existingStudent.documentations.find(
				(doc) => doc.timestamp === submission.timestamp
			);
			if (existingSubmission) {
				// Do nothing
				console.log(
					`-- Documentation with timestamp ${submission.timestamp} already exists for user with crefito ${existingStudent.crefito}`
				);
				return;
			} else {
				// Add the submission
				console.log(
					`-- Adding documentation with timestamp ${submission.timestamp} for user with crefito ${existingStudent.crefito}`
				);
				const documentation =
					DocumentationRepository.createDocumentationFromSubmission(
						existingStudent,
						submission
					);
				// Add complete Documentation to student
				existingStudent.addDocumentation(documentation);
			}
		}
		// If the student doesn't exist, create it
		else {
			console.log(`-- Creating new student with crefito ${submission.crefito}`);
			// Create new student
			const student = new Student(submission, PROJECT_ROOT); // The constructor wont add the documentation automatically
			const documentation =
				DocumentationRepository.createDocumentationFromSubmission(
					student,
					submission
				);
			student.addDocumentation(documentation);
			await this.em.persistAndFlush(student);
		}
	}
}
