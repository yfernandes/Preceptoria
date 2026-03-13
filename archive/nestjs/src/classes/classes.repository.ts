import { EntityRepository } from "@mikro-orm/postgresql"
import type { Classes } from "./classes.entity"

export class ClassesRepository extends EntityRepository<Classes> {}
