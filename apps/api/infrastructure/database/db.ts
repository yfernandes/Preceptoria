import { EntityManager, EntityRepository, MikroORM } from "@mikro-orm/core";

import { localConfig } from "./config/mikro-orm.config.js";
import {
	Classes,
	User,
	Course,
	Hospital,
	HospitalManager,
	OrgAdmin,
	Preceptor,
	School,
	Shift,
	Student,
	Supervisor,
	SysAdmin,
	Document,
} from "@api/modules/entities.js";

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
export const db = await initORM();
