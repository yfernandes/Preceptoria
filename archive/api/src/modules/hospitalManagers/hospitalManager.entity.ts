import { Role } from "@api/modules/common/role.abstract"

import type { Hospital } from "@api/modules/hospitals/hospital.entity"
import type { User } from "@api/modules/users/user.entity"
import { Entity, ManyToOne, type Rel } from "@mikro-orm/postgresql"

@Entity()
export class HospitalManager extends Role {
	@ManyToOne()
	hospital: Rel<Hospital>

	constructor(user: Rel<User>, hospital: Rel<Hospital>) {
		super(user)
		this.hospital = hospital
	}
}
