import { Role } from "@api/modules/common/role.abstract"

import { Hospital } from "@api/modules/hospitals/hospital.entity"
import { Shift } from "@api/modules/shifts/shift.entity"
import type { User } from "@api/modules/users/user.entity"
import { Collection, Entity, ManyToOne, OneToMany, Property, type Rel } from "@mikro-orm/postgresql"

@Entity()
export class Preceptor extends Role {
	@ManyToOne(() => Hospital)
	hospital: Hospital

	@OneToMany(
		() => Shift,
		(e) => e.preceptor
	)
	shifts = new Collection<Shift>(this)

	@Property()
	specialty!: string

	@Property()
	licenseNumber!: string

	constructor(user: Rel<User>, hospital: Rel<Hospital>) {
		super(user)
		this.hospital = hospital
	}
}
