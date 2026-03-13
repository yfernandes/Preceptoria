import { EntityRepository } from "@mikro-orm/core"
import type { OrgAdmin } from "./OrgAdmin.entity"

export class OrgAdminRepository extends EntityRepository<OrgAdmin> {}
