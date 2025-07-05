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
	HospitalManager
} from "../entities";
import { DocumentType } from "../entities/document.entity";
import { GoogleSheetsService } from "../services/googleSheets";
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
			phone: "+55 71 3000-0000"
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
				phone: "+55 71 3000-1000"
			},
			{
				name: "Hospital Santa Isabel",
				address: "Rua Santa Isabel, 789 - Salvador, BA",
				email: "contato@hospitalsantaisabel.com.br",
				phone: "+55 71 3000-2000"
			}
		];

		for (const hospitalData of hospitals) {
			const existingHospital = await em.findOne(Hospital, { name: hospitalData.name });
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
		console.log(`✅ Seeded ${hospitals.length} hospitals`);
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
				password: this.generateTemporaryPassword(),
				roles: [UserRoles.SysAdmin]
			},
			{
				name: "Ayala Fernandes",
				email: "ayala.fernandes@faculdadesantacasa.edu.br",
				phone: "+55 71 99999-1111",
				password: this.generateTemporaryPassword(),
				roles: [UserRoles.OrgAdmin, UserRoles.Supervisor]
			},
			{
				name: "Daniel Silva",
				email: "daniel.silva@hms.salvador.ba.gov.br",
				phone: "+55 71 99999-2222",
				password: this.generateTemporaryPassword(),
				roles: [UserRoles.OrgAdmin, UserRoles.HospitalManager]
			},
			{
				name: "Carla Santos",
				email: "carla.santos@hospitalsantaisabel.com.br",
				phone: "+55 71 99999-3333",
				password: this.generateTemporaryPassword(),
				roles: [UserRoles.OrgAdmin, UserRoles.HospitalManager]
			}
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
		console.log(`✅ Seeded ${users.length} users`);
	}

	private generateTemporaryPassword(): string {
		return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
	}
}

export class RolesSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		console.log("🔐 Seeding roles...");

		const yagoUser = await em.findOne(User, { email: "yagoalmeida@gmail.com" });
		const ayalaUser = await em.findOne(User, { email: "ayala.fernandes@faculdadesantacasa.edu.br" });
		const danielUser = await em.findOne(User, { email: "daniel.silva@hms.salvador.ba.gov.br" });
		const carlaUser = await em.findOne(User, { email: "carla.santos@hospitalsantaisabel.com.br" });

		const santaCasaSchool = await em.findOne(School, { name: "Faculdade Santa Casa" });
		const hmsHospital = await em.findOne(Hospital, { name: "Hospital Municipal de Salvador" });
		const hsiHospital = await em.findOne(Hospital, { name: "Hospital Santa Isabel" });

		if (yagoUser && !(await em.findOne(SysAdmin, { user: yagoUser.id }))) {
			const sysAdmin = new SysAdmin(yagoUser);
			em.persist(sysAdmin);
		}

		if (ayalaUser && santaCasaSchool && !(await em.findOne(OrgAdmin, { user: ayalaUser.id }))) {
			const orgAdmin = new OrgAdmin(ayalaUser);
			orgAdmin.school = santaCasaSchool;
			em.persist(orgAdmin);
		}

		if (ayalaUser && santaCasaSchool && !(await em.findOne(Supervisor, { user: ayalaUser.id }))) {
			const supervisor = new Supervisor(ayalaUser, santaCasaSchool);
			em.persist(supervisor);
		}

		if (danielUser && hmsHospital && !(await em.findOne(OrgAdmin, { user: danielUser.id }))) {
			const orgAdmin = new OrgAdmin(danielUser);
			orgAdmin.hospital = hmsHospital;
			em.persist(orgAdmin);
		}

		if (danielUser && hmsHospital && !(await em.findOne(HospitalManager, { user: danielUser.id }))) {
			const hospManager = new HospitalManager(danielUser, hmsHospital);
			em.persist(hospManager);
		}

		if (carlaUser && hsiHospital && !(await em.findOne(OrgAdmin, { user: carlaUser.id }))) {
			const orgAdmin = new OrgAdmin(carlaUser);
			orgAdmin.hospital = hsiHospital;
			em.persist(orgAdmin);
		}

		if (carlaUser && hsiHospital && !(await em.findOne(HospitalManager, { user: carlaUser.id }))) {
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

		const santaCasaSchool = await em.findOne(School, { name: "Faculdade Santa Casa" });
		const ayalaSupervisor = await em.findOne(Supervisor, { user: { email: "ayala.fernandes@faculdadesantacasa.edu.br" } });

		if (santaCasaSchool && ayalaSupervisor) {
			const courseName = "Fisioterapia em Neonatologia e Pediatria";
			const existingCourse = await em.findOne(Course, { name: courseName });
			
			if (!existingCourse) {
				const course = new Course(courseName, santaCasaSchool, ayalaSupervisor);
				em.persist(course);
				await em.flush();
				console.log("✅ Seeded Fisioterapia em Neonatologia e Pediatria course");
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
			const course = await em.findOne(Course, { name: "Fisioterapia em Neonatologia e Pediatria" });
			if (!course) {
				console.log("⚠️ Course not found, skipping class seeding");
				return;
			}

			if (Bun.env.GOOGLE_SPREADSHEET_ID) {
				const googleSheets = new GoogleSheetsService();
				const submissions = await googleSheets.getSubmissions(Bun.env.GOOGLE_SPREADSHEET_ID);
				
				const classNumbers = [...new Set(submissions.map(s => s.classNumber).filter(Boolean))];
				
				console.log(`📊 Found ${classNumbers.length} unique class numbers: ${classNumbers.join(', ')}`);

				for (const classNumber of classNumbers) {
					const existingClass = await em.findOne(Classes, { 
						name: classNumber,
						course: course.id 
					});
					
					if (!existingClass) {
						const classEntity = new Classes(classNumber, course);
						em.persist(classEntity);
					}
				}

				await em.flush();
				console.log(`✅ Seeded ${classNumbers.length} classes from Google Sheets`);
			} else {
				console.log("⚠️ No Google Sheets ID configured, skipping class seeding");
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
			console.log("⚠️ No Google Sheets ID configured, skipping student seeding");
			return;
		}

		try {
			const googleSheets = new GoogleSheetsService();
			const submissions = await googleSheets.getSubmissions(Bun.env.GOOGLE_SPREADSHEET_ID);
			
			console.log(`📊 Processing ${submissions.length} student submissions...`);

			let createdCount = 0;
			for (const submission of submissions) {
				try {
					const existingStudent = await em.findOne(Student, {
						user: { email: submission.email }
					});

					if (!existingStudent) {
						let user = await em.findOne(User, { email: submission.email });
						if (!user) {
							user = await User.create(
								submission.fullName,
								submission.email,
								submission.phone,
								this.generateTemporaryPassword()
							);
							user.roles = [UserRoles.Student];
							em.persist(user);
						}

						let school = await em.findOne(School, { name: submission.studentsSchoolId });
						if (!school) {
							school = await em.findOne(School, { name: "Faculdade Santa Casa" });
						}

						let supervisor = await em.findOne(Supervisor, {
							user: { email: "ayala.fernandes@faculdadesantacasa.edu.br" }
						});

						let course = await em.findOne(Course, { name: "Fisioterapia em Neonatologia e Pediatria" });

						let classEntity = await em.findOne(Classes, {
							course: course?.id,
							name: submission.classNumber
						});

						if (user && classEntity) {
							const student = new Student(user, classEntity);
							em.persist(student);
							createdCount++;
						}
					}
				} catch (error) {
					console.error(`Error processing student ${submission.fullName}:`, error);
				}
			}

			await em.flush();
			console.log(`✅ Created ${createdCount} new students`);
		} catch (error) {
			console.error("Error seeding students:", error);
		}
	}

	private generateTemporaryPassword(): string {
		return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
	}
}

export class DocumentsSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		console.log("📄 Seeding documents from Google Sheets...");

		if (!Bun.env.GOOGLE_SPREADSHEET_ID) {
			console.log("⚠️ No Google Sheets ID configured, skipping document seeding");
			return;
		}

		try {
			const googleSheets = new GoogleSheetsService();
			const submissions = await googleSheets.getSubmissions(Bun.env.GOOGLE_SPREADSHEET_ID);
			
			console.log(`📊 Processing documents for ${submissions.length} students...`);

			let createdCount = 0;
			for (const submission of submissions) {
				try {
					const student = await em.findOne(Student, {
						user: { email: submission.email }
					}, { populate: ['user'] });

					if (!student) {
						continue;
					}

					const { documentation } = submission;

					for (const url of documentation.vaccinationCard) {
						await this.createDocumentFromUrl(url, student, DocumentType.VACCINATION_CARD, em);
						createdCount++;
					}

					for (const url of documentation.professionalIdentityFront) {
						await this.createDocumentFromUrl(url, student, DocumentType.PROFESSIONAL_ID, em);
						createdCount++;
					}

					for (const url of documentation.professionalIdentityBack) {
						await this.createDocumentFromUrl(url, student, DocumentType.PROFESSIONAL_ID, em);
						createdCount++;
					}

					for (const url of documentation.internshipCommitmentTerm) {
						await this.createDocumentFromUrl(url, student, DocumentType.COMMITMENT_CONTRACT, em);
						createdCount++;
					}

					for (const url of documentation.cityHospitalForm) {
						await this.createDocumentFromUrl(url, student, DocumentType.ADMISSION_FORM, em);
						createdCount++;
					}

					if (documentation.badgePicture) {
						await this.createDocumentFromUrl(documentation.badgePicture, student, DocumentType.BADGE_PICTURE, em);
						createdCount++;
					}

				} catch (error) {
					console.error(`Error processing documents for ${submission.fullName}:`, error);
				}
			}

			await em.flush();
			console.log(`✅ Created ${createdCount} documents`);
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