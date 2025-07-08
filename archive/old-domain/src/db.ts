import { EntityManager, MikroORM } from "@mikro-orm/sqlite";
import type { Options } from "@mikro-orm/sqlite";

// Entities
import {
	Student,
	Documentation,
	Document,
	Submission,
} from "entities/entities";

// Repositories
import {
	StudentRepository,
	DocumentationRepository,
	DocumentRepository,
	SubmissionRepository,
} from "entities/repositories";

import config from "./mikro-orm.config.js";

export interface Services {
	orm: MikroORM;
	em: EntityManager;
	student: StudentRepository;
	documentation: DocumentationRepository;
	document: DocumentRepository;
	submission: SubmissionRepository;
}

let cache: Services;

export async function initOrm(options?: Options): Promise<Services> {
	if (cache) {
		return cache;
	}

	// allow overriding config options for testing
	const orm: MikroORM = await MikroORM.init({
		...config,
		...options,
	});

	// save to cache before returning
	return (cache = {
		orm,
		em: orm.em,
		student: orm.em.getRepository(Student),
		documentation: orm.em.getRepository(Documentation),
		document: orm.em.getRepository(Document),
		submission: orm.em.getRepository(Submission),
	});
}
