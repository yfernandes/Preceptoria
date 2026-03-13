import { EntityRepository } from "@mikro-orm/postgresql"
import type { HospitalManager } from "./hospitalManager.entity"

export class HospitalManagerRepository extends EntityRepository<HospitalManager> {}
