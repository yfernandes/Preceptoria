import { EntityRepository } from "@mikro-orm/postgresql"
import type { Shift } from "./shift.entity"

export class ShiftRepository extends EntityRepository<Shift> {}
