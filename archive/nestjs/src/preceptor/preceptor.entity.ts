import {
	Collection,
	Entity,
	EntityRepositoryType,
	ManyToOne,
	OneToMany,
	type Rel,
} from "@mikro-orm/core"
import { Hospital } from "src/hospital/hospital.entity"
import { Role } from "src/role.abstract"
import { Shift } from "src/shift/shift.entity"
import type { User } from "src/user/user.entity"
import type { PreceptorRepository } from "./preceptor.repository"

@Entity()
export class Preceptor extends Role {
	[EntityRepositoryType]?: PreceptorRepository

	@ManyToOne(() => Hospital)
	hospital: Hospital

	@OneToMany(
		() => Shift,
		(e) => e.preceptor
	)
	shifts = new Collection<Shift>(this)

	constructor(user: Rel<User>, hospital: Rel<Hospital>) {
		super(user)
		this.hospital = hospital
	}
}
