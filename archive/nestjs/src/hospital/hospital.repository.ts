import { EntityRepository } from "@mikro-orm/postgresql"
import type { Hospital } from "./hospital.entity"

export class HospitalRepository extends EntityRepository<Hospital> {}
