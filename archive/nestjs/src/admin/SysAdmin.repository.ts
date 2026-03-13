import { EntityRepository } from "@mikro-orm/postgresql"
import type { SysAdmin } from "./SysAdmin.entity"

export class SysAdminRepository extends EntityRepository<SysAdmin> {}
