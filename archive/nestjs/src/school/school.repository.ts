import { EntityRepository } from "@mikro-orm/postgresql"
import type { School } from "./school.entity"

export class SchoolRepository extends EntityRepository<School> {}
