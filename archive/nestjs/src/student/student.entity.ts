import {
	Collection,
	Entity,
	EntityRepositoryType,
	ManyToMany,
	ManyToOne,
	OneToMany,
	type Rel,
} from "@mikro-orm/core"
import { Classes } from "src/classes/classes.entity"
import { Document } from "src/documents/document.entity"
import { Role } from "src/role.abstract"
import type { Shift } from "src/shift/shift.entity"
import type { User } from "src/user/user.entity"
import { StudentRepository } from "./student.repository"

@Entity({ repository: () => StudentRepository })
export class Student extends Role {
	[EntityRepositoryType]?: StudentRepository

	@OneToMany(
		() => Document,
		(document) => document.student
	)
	documents = new Collection<Document>(this)

	@ManyToOne(() => Classes)
	class: Rel<Classes>

	@ManyToMany()
	shifts = new Collection<Shift>(this)

	constructor(user: User, classes: Classes) {
		super(user)
		this.class = classes
	}
}
