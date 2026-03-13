import { Entity, EntityRepositoryType, ManyToOne, type Rel } from "@mikro-orm/core"
import { Hospital } from "src/hospital/hospital.entity"
import { Role } from "src/role.abstract"
import { School } from "src/school/school.entity"
import { OrgAdminRepository } from "./OrgAdmin.repository"

@Entity({ repository: () => OrgAdminRepository })
export class OrgAdmin extends Role {
	[EntityRepositoryType]?: OrgAdminRepository

	@ManyToOne(() => Hospital, { nullable: true })
	hospital?: Rel<Hospital>

	@ManyToOne(() => School, { nullable: true })
	school?: Rel<School>
}
