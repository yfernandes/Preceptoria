import { Entity, EntityRepositoryType } from "@mikro-orm/core"
import { Role } from "src/role.abstract"
import { SysAdminRepository } from "./SysAdmin.repository"

@Entity({ repository: () => SysAdminRepository })
export class SysAdmin extends Role {
	// Bestowed at birth with the powers of a GOD MUAHAUHAUHAUAHA
	[EntityRepositoryType]?: SysAdminRepository
}
