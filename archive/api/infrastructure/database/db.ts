import { EntityManager, EntityRepository, MikroORM } from "@mikro-orm/core";

import { localConfig } from "./config/mikro-orm.config";
import { User } from "@api/modules/users/user.entity";
import { SysAdmin } from "@api/modules/admin/SysAdmin.entity";
import { OrgAdmin } from "@api/modules/admin/OrgAdmin.entity";
import { Classes } from "@api/modules/classes/classes.entity";
import { Course } from "@api/modules/courses/course.entity";
import { Document } from "@api/modules/documents/document.entity";
import { Hospital } from "@api/modules/hospitals/hospital.entity";
import { HospitalManager } from "@api/modules/hospitalManagers/hospitalManager.entity";
import { Preceptor } from "@api/modules/preceptors/preceptor.entity";
import { School } from "@api/modules/schools/school.entity";
import { Shift } from "@api/modules/shifts/shift.entity";
import { Student } from "@api/modules/students/student.entity";
import { Supervisor } from "@api/modules/supervisors/supervisor.entity";

export interface Services {
	orm: MikroORM;
	em: EntityManager;
	user: EntityRepository<User>;
	sysAdmin: EntityRepository<SysAdmin>;
	orgAdmin: EntityRepository<OrgAdmin>;
	classes: EntityRepository<Classes>;
	course: EntityRepository<Course>;
	document: EntityRepository<Document>;
	hospital: EntityRepository<Hospital>;
	hospitalManager: EntityRepository<HospitalManager>;
	preceptor: EntityRepository<Preceptor>;
	school: EntityRepository<School>;
	shift: EntityRepository<Shift>;
	student: EntityRepository<Student>;
	supervisor: EntityRepository<Supervisor>;
}

let cache: Services | null = null;

export async function initORM(): Promise<Services> {
	if (cache) {
		return cache;
	}

	const orm = await MikroORM.init(localConfig);

	// save to cache before returning
	return (cache = {
		orm,
		em: orm.em,
		user: orm.em.getRepository(User),
		sysAdmin: orm.em.getRepository(SysAdmin),
		orgAdmin: orm.em.getRepository(OrgAdmin),
		classes: orm.em.getRepository(Classes),
		course: orm.em.getRepository(Course),
		document: orm.em.getRepository(Document),
		hospital: orm.em.getRepository(Hospital),
		hospitalManager: orm.em.getRepository(HospitalManager),
		preceptor: orm.em.getRepository(Preceptor),
		school: orm.em.getRepository(School),
		shift: orm.em.getRepository(Shift),
		student: orm.em.getRepository(Student),
		supervisor: orm.em.getRepository(Supervisor),
	});
}

// Export a lazy db object that initializes on first access
let dbInstance: Services | null = null;

export const db = {
	get orm() {
		if (!dbInstance) {
			throw new Error("Database not initialized. Call await initORM() first.");
		}
		return dbInstance.orm;
	},
	get em() {
		if (!dbInstance) {
			throw new Error("Database not initialized. Call await initORM() first.");
		}
		return dbInstance.em;
	},
	get user() {
		if (!dbInstance) {
			throw new Error("Database not initialized. Call await initORM() first.");
		}
		return dbInstance.user;
	},
	get sysAdmin() {
		if (!dbInstance) {
			throw new Error("Database not initialized. Call await initORM() first.");
		}
		return dbInstance.sysAdmin;
	},
	get orgAdmin() {
		if (!dbInstance) {
			throw new Error("Database not initialized. Call await initORM() first.");
		}
		return dbInstance.orgAdmin;
	},
	get classes() {
		if (!dbInstance) {
			throw new Error("Database not initialized. Call await initORM() first.");
		}
		return dbInstance.classes;
	},
	get course() {
		if (!dbInstance) {
			throw new Error("Database not initialized. Call await initORM() first.");
		}
		return dbInstance.course;
	},
	get document() {
		if (!dbInstance) {
			throw new Error("Database not initialized. Call await initORM() first.");
		}
		return dbInstance.document;
	},
	get hospital() {
		if (!dbInstance) {
			throw new Error("Database not initialized. Call await initORM() first.");
		}
		return dbInstance.hospital;
	},
	get hospitalManager() {
		if (!dbInstance) {
			throw new Error("Database not initialized. Call await initORM() first.");
		}
		return dbInstance.hospitalManager;
	},
	get preceptor() {
		if (!dbInstance) {
			throw new Error("Database not initialized. Call await initORM() first.");
		}
		return dbInstance.preceptor;
	},
	get school() {
		if (!dbInstance) {
			throw new Error("Database not initialized. Call await initORM() first.");
		}
		return dbInstance.school;
	},
	get shift() {
		if (!dbInstance) {
			throw new Error("Database not initialized. Call await initORM() first.");
		}
		return dbInstance.shift;
	},
	get student() {
		if (!dbInstance) {
			throw new Error("Database not initialized. Call await initORM() first.");
		}
		return dbInstance.student;
	},
	get supervisor() {
		if (!dbInstance) {
			throw new Error("Database not initialized. Call await initORM() first.");
		}
		return dbInstance.supervisor;
	},
};

// Initialize the database when needed
export async function initializeDatabase() {
	dbInstance ??= await initORM();
	return dbInstance;
}
