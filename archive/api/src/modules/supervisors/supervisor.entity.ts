import { Collection, Entity, ManyToOne, OneToMany, type Rel } from "@mikro-orm/postgresql"
import { Role } from "../common/role.abstract"
import { Course } from "../courses/course.entity"
import { School } from "../schools/school.entity"
import type { User } from "../users/user.entity"

@Entity()
export class Supervisor extends Role {
	@ManyToOne(() => School)
	school: Rel<School>

	@OneToMany(
		() => Course,
		(e) => e.supervisor
	)
	courses = new Collection<Course>(this)

	constructor(user: Rel<User>, school: Rel<School>) {
		super(user)
		this.school = school
	}
}
