import { Seeder } from "@mikro-orm/seeder";
import { EntityManager } from "@mikro-orm/postgresql";
import {
	User,
	School,
	Supervisor,
	Course,
	Classes,
	Student,
	Document,
	Hospital,
	OrgAdmin,
	SysAdmin,
	HospitalManager,
} from "../entities";
import { DocumentType } from "../modules/documents";
import {
	GoogleSheetsService,
	// ConsolidatedSubmission,
} from "../services/googleSheets";
import { UserRoles } from "../entities/role.abstract";

export class DatabaseSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		console.log("🌱 Starting database seeding for Faculdade Santa Casa...");

		await this.call(em, [
			SchoolsSeeder,
			HospitalsSeeder,
			UsersSeeder,
			RolesSeeder,
			CoursesSeeder,
			ClassesSeeder,
			StudentsSeeder,
			DocumentsSeeder,
		]);

		console.log("✅ Database seeding completed!");
	}
}

export class SchoolsSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		console.log("🏫 Seeding Faculdade Santa Casa...");

		const schoolData = {
			name: "Faculdade Santa Casa",
			address: "Rua Santa Casa, 123 - Salvador, BA",
			email: "contato@faculdadesantacasa.edu.br",
			phone: "+55 71 3000-0000",
		};

		const existingSchool = await em.findOne(School, { name: schoolData.name });
		if (!existingSchool) {
			const school = new School(
				schoolData.name,
				schoolData.address,
				schoolData.email,
				schoolData.phone
			);
			em.persist(school);
			await em.flush();
			console.log("✅ Seeded Faculdade Santa Casa");
		} else {
			console.log("✅ Faculdade Santa Casa already exists");
		}
	}
}

export class HospitalsSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		console.log("🏥 Seeding hospitals...");

		const hospitals = [
			{
				name: "Hospital Municipal de Salvador",
				address: "Av. Municipal, 456 - Salvador, BA",
				email: "contato@hms.salvador.ba.gov.br",
				phone: "+55 71 3000-1000",
			},
			{
				name: "Hospital Santa Isabel",
				address: "Rua Santa Isabel, 789 - Salvador, BA",
				email: "contato@hospitalsantaisabel.com.br",
				phone: "+55 71 3000-2000",
			},
		];

		for (const hospitalData of hospitals) {
			const existingHospital = await em.findOne(Hospital, {
				name: hospitalData.name,
			});
			if (!existingHospital) {
				const hospital = new Hospital(
					hospitalData.name,
					hospitalData.address,
					hospitalData.email,
					hospitalData.phone
				);
				em.persist(hospital);
			}
		}

		await em.flush();
		console.log(`✅ Seeded ${hospitals.length.toString()} hospitals`);
	}
}

export class UsersSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		console.log("👥 Seeding users...");

		const users = [
			{
				name: "Yago Fernandes de Almeida",
				email: "yagoalmeida@gmail.com",
				phone: "+55(71)993131586",
				password: Bun.env.ADMIN_PASSWORD ?? "TotallyS3cr3tP4ssw_rd",
				roles: [UserRoles.SysAdmin],
			},
			{
				name: "Ayala Fernandes",
				email: "ayala.fernandes@faculdadesantacasa.edu.br",
				phone: "+55 71 99999-1111",
				password: this.generateTemporaryPassword(),
				roles: [UserRoles.OrgAdmin, UserRoles.Supervisor],
			},
			{
				name: "Daniel Silva",
				email: "daniel.silva@hms.salvador.ba.gov.br",
				phone: "+55 71 99999-2222",
				password: this.generateTemporaryPassword(),
				roles: [UserRoles.OrgAdmin, UserRoles.HospitalManager],
			},
			{
				name: "Carla Santos",
				email: "carla.santos@hospitalsantaisabel.com.br",
				phone: "+55 71 99999-3333",
				password: this.generateTemporaryPassword(),
				roles: [UserRoles.OrgAdmin, UserRoles.HospitalManager],
			},
		];

		for (const userData of users) {
			const existingUser = await em.findOne(User, { email: userData.email });
			if (!existingUser) {
				const user = await User.create(
					userData.name,
					userData.email,
					userData.phone,
					userData.password
				);
				user.roles = userData.roles;
				em.persist(user);
			}
		}

		await em.flush();
		console.log(`✅ Seeded ${users.length.toString()} users`);
	}

	private generateTemporaryPassword(): string {
		return (
			Math.random().toString(36).slice(-8) +
			Math.random().toString(36).slice(-8)
		);
	}
}

export class RolesSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		console.log("🔐 Seeding roles...");

		const yagoUser = await em.findOne(User, { email: "yagoalmeida@gmail.com" });
		const ayalaUser = await em.findOne(User, {
			email: "ayala.fernandes@faculdadesantacasa.edu.br",
		});
		const danielUser = await em.findOne(User, {
			email: "daniel.silva@hms.salvador.ba.gov.br",
		});
		const carlaUser = await em.findOne(User, {
			email: "carla.santos@hospitalsantaisabel.com.br",
		});

		const santaCasaSchool = await em.findOne(School, {
			name: "Faculdade Santa Casa",
		});
		const hmsHospital = await em.findOne(Hospital, {
			name: "Hospital Municipal de Salvador",
		});
		const hsiHospital = await em.findOne(Hospital, {
			name: "Hospital Santa Isabel",
		});

		if (yagoUser && !(await em.findOne(SysAdmin, { user: yagoUser.id }))) {
			const sysAdmin = new SysAdmin(yagoUser);
			em.persist(sysAdmin);
		}

		if (
			ayalaUser &&
			santaCasaSchool &&
			!(await em.findOne(OrgAdmin, { user: ayalaUser.id }))
		) {
			const orgAdmin = new OrgAdmin(ayalaUser);
			orgAdmin.school = santaCasaSchool;
			em.persist(orgAdmin);
		}

		if (
			ayalaUser &&
			santaCasaSchool &&
			!(await em.findOne(Supervisor, { user: ayalaUser.id }))
		) {
			const supervisor = new Supervisor(ayalaUser, santaCasaSchool);
			em.persist(supervisor);
		}

		if (
			danielUser &&
			hmsHospital &&
			!(await em.findOne(OrgAdmin, { user: danielUser.id }))
		) {
			const orgAdmin = new OrgAdmin(danielUser);
			orgAdmin.hospital = hmsHospital;
			em.persist(orgAdmin);
		}

		if (
			danielUser &&
			hmsHospital &&
			!(await em.findOne(HospitalManager, { user: danielUser.id }))
		) {
			const hospManager = new HospitalManager(danielUser, hmsHospital);
			em.persist(hospManager);
		}

		if (
			carlaUser &&
			hsiHospital &&
			!(await em.findOne(OrgAdmin, { user: carlaUser.id }))
		) {
			const orgAdmin = new OrgAdmin(carlaUser);
			orgAdmin.hospital = hsiHospital;
			em.persist(orgAdmin);
		}

		if (
			carlaUser &&
			hsiHospital &&
			!(await em.findOne(HospitalManager, { user: carlaUser.id }))
		) {
			const hospManager = new HospitalManager(carlaUser, hsiHospital);
			em.persist(hospManager);
		}

		await em.flush();
		console.log("✅ Seeded roles");
	}
}

export class CoursesSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		console.log("📚 Seeding course...");

		const santaCasaSchool = await em.findOne(School, {
			name: "Faculdade Santa Casa",
		});
		const ayalaSupervisor = await em.findOne(Supervisor, {
			user: { email: "ayala.fernandes@faculdadesantacasa.edu.br" },
		});

		if (santaCasaSchool && ayalaSupervisor) {
			const courseName = "Fisioterapia em Neonatologia e Pediatria";
			const existingCourse = await em.findOne(Course, { name: courseName });

			if (!existingCourse) {
				const course = new Course(courseName, santaCasaSchool, ayalaSupervisor);
				em.persist(course);
				await em.flush();
				console.log(
					"✅ Seeded Fisioterapia em Neonatologia e Pediatria course"
				);
			} else {
				console.log("✅ Course already exists");
			}
		}
	}
}

export class ClassesSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		console.log("🎓 Seeding classes from Google Sheets...");

		try {
			const course = await em.findOne(Course, {
				name: "Fisioterapia em Neonatologia e Pediatria",
			});
			if (!course) {
				console.log("⚠️ Course not found, skipping class seeding");
				return;
			}

			if (Bun.env.GOOGLE_SPREADSHEET_ID) {
				const googleSheets = new GoogleSheetsService();
				const rawSubmissions = await googleSheets.getSubmissions(
					Bun.env.GOOGLE_SPREADSHEET_ID
				);
				const consolidatedSubmissions =
					googleSheets.consolidateSubmissionsByCrefito(rawSubmissions);

				const classNumbers = [
					...new Set(
						consolidatedSubmissions.map((s) => s.classNumber).filter(Boolean)
					),
				];

				console.log(
					`📊 Found ${classNumbers.length.toString()} unique class numbers: ${classNumbers.join(", ")}`
				);

				for (const classNumber of classNumbers) {
					const existingClass = await em.findOne(Classes, {
						name: classNumber,
						course: course.id,
					});

					if (!existingClass) {
						const classEntity = new Classes(classNumber, course);
						em.persist(classEntity);
						console.log(`✅ Created class: ${classNumber}`);
					}
				}

				await em.flush();
				console.log(
					`✅ Seeded ${classNumbers.length.toString()} classes from Google Sheets`
				);
			} else {
				console.log(
					"⚠️ No Google Sheets ID configured, skipping class seeding"
				);
			}
		} catch (error) {
			console.error("Error seeding classes:", error);
		}
	}
}

export class StudentsSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		console.log("👨‍🎓 Seeding students from Google Sheets...");

		if (!Bun.env.GOOGLE_SPREADSHEET_ID) {
			console.log(
				"⚠️ No Google Sheets ID configured, skipping student seeding"
			);
			return;
		}

		try {
			const googleSheets = new GoogleSheetsService();
			const rawSubmissions = await googleSheets.getSubmissions(
				Bun.env.GOOGLE_SPREADSHEET_ID
			);
			const consolidatedSubmissions =
				googleSheets.consolidateSubmissionsByCrefito(rawSubmissions);

			console.log(
				`📊 Processing ${consolidatedSubmissions.length.toString()} consolidated students...`
			);

			let createdCount = 0;
			let updatedCount = 0;

			for (const submission of consolidatedSubmissions) {
				try {
					// Process ALL entries - even incomplete ones
					console.log(
						`📝 Processing student (Crefito: ${submission.crefito}): ${submission.fullName} (${submission.entryCount.toString()} entries)`
					);

					// Check if student already exists by email
					const existingStudent = await em.findOne(Student, {
						user: { email: submission.email },
					});

					if (existingStudent) {
						console.log(
							`ℹ️ Student already exists: ${submission.fullName} (${submission.email})`
						);
						continue;
					}

					// Create or find user (try by email first, then by Crefito)
					let user = await em.findOne(User, { email: submission.email });
					if (!user && submission.crefito) {
						user = await em.findOne(User, {
							professionalIdentityNumber: submission.crefito,
						});
					}

					if (!user) {
						// Create new user with all available data
						user = await User.create(
							submission.fullName,
							submission.email,
							submission.phone,
							this.generateTemporaryPassword(),
							submission.crefito
						);
						user.roles = [UserRoles.Student];
						em.persist(user);
						console.log(
							`✅ Created new user: ${submission.fullName} (Crefito: ${submission.crefito})`
						);
					} else {
						// Smart update: only update fields that are empty or contain placeholder values
						let updated = false;

						if (
							(!user.professionalIdentityNumber ||
								user.professionalIdentityNumber === "Not submitted") &&
							submission.crefito !== "Not submitted"
						) {
							user.professionalIdentityNumber = submission.crefito;
							updated = true;
						}
						if (
							(!user.email ||
								GoogleSheetsService.isPlaceholder(user.email, "email")) &&
							!GoogleSheetsService.isPlaceholder(submission.email, "email")
						) {
							user.email = submission.email;
							updated = true;
						}
						if (
							(!user.phoneNumber ||
								GoogleSheetsService.isPlaceholder(user.phoneNumber, "phone")) &&
							!GoogleSheetsService.isPlaceholder(submission.phone, "phone")
						) {
							user.phoneNumber = submission.phone;
							updated = true;
						}
						if (
							(!user.name ||
								GoogleSheetsService.isPlaceholder(user.name, "name")) &&
							!GoogleSheetsService.isPlaceholder(submission.fullName, "name")
						) {
							user.name = submission.fullName;
							updated = true;
						}

						if (updated) {
							console.log(
								`🔄 Updated user: ${submission.fullName} (Crefito: ${submission.crefito})`
							);
							updatedCount++;
						} else {
							console.log(
								`ℹ️ No updates needed for: ${submission.fullName} (Crefito: ${submission.crefito})`
							);
						}
					}

					// Find class
					let classEntity = await em.findOne(Classes, {
						name: submission.classNumber,
					});

					if (!classEntity) {
						console.log(
							`⚠️ Class not found: ${submission.classNumber}, creating default class`
						);
						const course = await em.findOne(Course, {
							name: "Fisioterapia em Neonatologia e Pediatria",
						});
						if (course) {
							classEntity = new Classes(submission.classNumber, course);
							em.persist(classEntity);
						}
					}

					if (classEntity) {
						const student = new Student(user, classEntity);
						em.persist(student);
						createdCount++;
						console.log(
							`✅ Created student: ${submission.fullName} (Crefito: ${submission.crefito}, ${submission.entryCount.toString()} entries)`
						);
					}
				} catch (error) {
					console.error(
						`Error processing student ${submission.fullName} (Crefito: ${submission.crefito}):`,
						error
					);
				}
			}

			await em.flush();
			console.log(`✅ Created ${createdCount.toString()} new students`);
			console.log(`🔄 Updated ${updatedCount.toString()} existing students`);
		} catch (error) {
			console.error("Error seeding students:", error);
		}
	}

	private generateTemporaryPassword(): string {
		return (
			Math.random().toString(36).slice(-8) +
			Math.random().toString(36).slice(-8)
		);
	}
}

export class DocumentsSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		console.log("📄 Seeding documents from Google Sheets...");

		if (!Bun.env.GOOGLE_SPREADSHEET_ID) {
			console.log(
				"⚠️ No Google Sheets ID configured, skipping document seeding"
			);
			return;
		}

		try {
			const googleSheets = new GoogleSheetsService();
			const rawSubmissions = await googleSheets.getSubmissions(
				Bun.env.GOOGLE_SPREADSHEET_ID
			);
			const consolidatedSubmissions =
				googleSheets.consolidateSubmissionsByCrefito(rawSubmissions);

			console.log(
				`📊 Processing documents for ${consolidatedSubmissions.length.toString()} consolidated students...`
			);

			// Debug: Count total documents by type
			let totalVaccinationCards = 0;
			let totalIdentityFront = 0;
			let totalIdentityBack = 0;
			let totalHSICommitments = 0;
			let totalHMSCommitments = 0;
			let totalHospitalForms = 0;
			let totalBadgePictures = 0;

			for (const submission of consolidatedSubmissions) {
				totalVaccinationCards +=
					submission.documentation.vaccinationCard.length;
				totalIdentityFront +=
					submission.documentation.professionalIdentityFront.length;
				totalIdentityBack +=
					submission.documentation.professionalIdentityBack.length;
				totalHSICommitments +=
					submission.documentation.internshipCommitmentTermHSI.length;
				totalHMSCommitments +=
					submission.documentation.internshipCommitmentTermHMS.length;
				totalHospitalForms += submission.documentation.cityHospitalForm.length;
				totalBadgePictures += submission.documentation.badgePicture.length;
			}

			console.log(`📊 Document counts by type:`);
			console.log(`  - Vaccination Cards: ${totalVaccinationCards.toString()}`);
			console.log(`  - Identity Front: ${totalIdentityFront.toString()}`);
			console.log(`  - Identity Back: ${totalIdentityBack.toString()}`);
			console.log(`  - HSI Commitments: ${totalHSICommitments.toString()}`);
			console.log(`  - HMS Commitments: ${totalHMSCommitments.toString()}`);
			console.log(`  - Hospital Forms: ${totalHospitalForms.toString()}`);
			console.log(`  - Badge Pictures: ${totalBadgePictures.toString()}`);
			console.log(
				`  - Total: ${(totalVaccinationCards + totalIdentityFront + totalIdentityBack + totalHSICommitments + totalHMSCommitments + totalHospitalForms + totalBadgePictures).toString()}`
			);

			let createdCount = 0;
			let processedCount = 0;

			for (const submission of consolidatedSubmissions) {
				try {
					// Process ALL entries - even incomplete ones
					console.log(
						`📄 Processing documents for student (Crefito: ${submission.crefito}): ${submission.fullName} (${submission.entryCount.toString()} entries)`
					);

					// Find student by email or by Crefito if email is placeholder
					let student = null;
					if (!GoogleSheetsService.isPlaceholder(submission.email, "email")) {
						student = await em.findOne(
							Student,
							{
								user: { email: submission.email },
							},
							{ populate: ["user"] }
						);
					}

					if (!student && submission.crefito) {
						student = await em.findOne(
							Student,
							{
								user: { professionalIdentityNumber: submission.crefito },
							},
							{ populate: ["user"] }
						);
					}

					if (!student) {
						console.log(
							`⚠️ Student not found for Crefito: ${submission.crefito} (${submission.fullName})`
						);
						continue;
					}

					const { documentation } = submission;

					for (const url of documentation.vaccinationCard) {
						await this.createDocumentFromUrl(
							url,
							student,
							DocumentType.VACCINATION_CARD,
							em
						);
						createdCount++;
					}

					for (const url of documentation.professionalIdentityFront) {
						await this.createDocumentFromUrl(
							url,
							student,
							DocumentType.PROFESSIONAL_ID,
							em
						);
						createdCount++;
					}

					for (const url of documentation.professionalIdentityBack) {
						await this.createDocumentFromUrl(
							url,
							student,
							DocumentType.PROFESSIONAL_ID,
							em
						);
						createdCount++;
					}

					// Handle HSI internship commitment terms
					for (const url of documentation.internshipCommitmentTermHSI) {
						await this.createDocumentFromUrl(
							url,
							student,
							DocumentType.COMMITMENT_CONTRACT,
							em
						);
						createdCount++;
					}

					// Handle HMS internship commitment terms
					for (const url of documentation.internshipCommitmentTermHMS) {
						await this.createDocumentFromUrl(
							url,
							student,
							DocumentType.COMMITMENT_CONTRACT,
							em
						);
						createdCount++;
					}

					for (const url of documentation.cityHospitalForm) {
						await this.createDocumentFromUrl(
							url,
							student,
							DocumentType.ADMISSION_FORM,
							em
						);
						createdCount++;
					}

					// Handle badge pictures (now an array)
					for (const url of documentation.badgePicture) {
						await this.createDocumentFromUrl(
							url,
							student,
							DocumentType.BADGE_PICTURE,
							em
						);
						createdCount++;
					}

					processedCount++;
					console.log(
						`✅ Processed documents for ${submission.fullName} (Crefito: ${submission.crefito}, ${submission.entryCount.toString()} entries, ${Object.values(documentation).flat().length.toString()} total docs)`
					);
				} catch (error) {
					console.error(
						`Error processing documents for ${submission.fullName} (Crefito: ${submission.crefito}):`,
						error
					);
				}
			}

			await em.flush();
			console.log(
				`✅ Created ${createdCount.toString()} documents for ${processedCount.toString()} students`
			);
		} catch (error) {
			console.error("Error seeding documents:", error);
		}
	}

	private async createDocumentFromUrl(
		url: string,
		student: Student,
		type: DocumentType,
		em: EntityManager
	): Promise<void> {
		try {
			const fileId = this.extractFileId(url);

			const existingDoc = await em.findOne(Document, {
				googleDriveId: fileId,
				student: student.id,
			});

			if (existingDoc) {
				return;
			}

			const document = new Document(
				`Imported ${type} for ${student.user.name}`,
				type,
				url,
				student,
				`Auto-imported from Google Sheets on ${new Date().toISOString()}`
			);

			document.googleDriveId = fileId;
			em.persist(document);
		} catch (error) {
			console.error(`Error creating document from URL ${url}:`, error);
		}
	}

	private extractFileId(url: string): string {
		const regex = /[-\w]{25,}/;
		const match = regex.exec(url);
		if (!match) {
			throw new Error(`Invalid Google Drive URL: ${url}`);
		}
		return match[0];
	}
}
