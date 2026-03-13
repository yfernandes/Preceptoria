import { Classes } from "@api/modules/classes"
import { Role } from "@api/modules/common/role.abstract"
import { Document } from "@api/modules/documents"
import type { Shift } from "@api/modules/shifts/shift.entity"
import type { User } from "@api/modules/users/user.entity"
import {
	Collection,
	Entity,
	ManyToMany,
	ManyToOne,
	OneToMany,
	type Rel,
} from "@mikro-orm/postgresql"

@Entity()
export class Student extends Role {
	@OneToMany(
		() => Document,
		(document) => document.student
	)
	documents = new Collection<Document>(this)

	@ManyToOne(() => Classes)
	class: Rel<Classes>

	@ManyToMany()
	shifts = new Collection<Shift>(this)

	constructor(user: Rel<User>, classes: Rel<Classes>) {
		super(user)
		this.class = classes
	}
}
