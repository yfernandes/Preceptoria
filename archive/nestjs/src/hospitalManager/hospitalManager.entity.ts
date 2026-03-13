import { Entity, EntityRepositoryType, ManyToOne, type Rel } from "@mikro-orm/core"
import type { Hospital } from "src/hospital/hospital.entity"
import { Role } from "src/role.abstract"
import type { User } from "src/user/user.entity"
import { HospitalManagerRepository } from "./hospitalManager.repository"

@Entity({ repository: () => HospitalManagerRepository })
export class HospitalManager extends Role {
	[EntityRepositoryType]?: HospitalManagerRepository

	@ManyToOne()
	hospital: Rel<Hospital>

	constructor(user: User, hospital: Hospital) {
		super(user)
		this.hospital = hospital
	}
}
