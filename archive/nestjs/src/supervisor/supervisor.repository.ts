import { EntityRepository } from "@mikro-orm/postgresql"
import type { Supervisor } from "./supervisor.entity"

export class SupervisorRepository extends EntityRepository<Supervisor> {}
