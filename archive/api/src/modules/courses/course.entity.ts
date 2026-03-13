import { Classes } from "@api/modules/classes/classes.entity"

import { BaseEntity } from "@api/modules/common/"
import type { School } from "@api/modules/schools/school.entity"
import type { Supervisor } from "@api/modules/supervisors/supervisor.entity"
import { Collection, Entity, ManyToOne, OneToMany, Property, type Rel } from "@mikro-orm/postgresql"

@Entity()
export class Course extends BaseEntity {
	@Property()
	name: string

	@ManyToOne()
	school: Rel<School>

	@OneToMany(
		() => Classes,
		(e) => e.course
	)
	classes = new Collection<Classes>(this)

	@ManyToOne()
	supervisor: Rel<Supervisor>

	constructor(name: string, school: Rel<School>, supervisor: Rel<Supervisor>) {
		super()
		this.name = name
		this.school = school
		this.supervisor = supervisor
	}
}
