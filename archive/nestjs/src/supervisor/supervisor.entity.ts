import { Collection, Entity, EntityRepositoryType, OneToMany } from "@mikro-orm/core"
import { Course } from "src/course/course.entity"
import { Role } from "src/role.abstract"
import { SupervisorRepository } from "./supervisor.repository"

@Entity({ repository: () => SupervisorRepository })
export class Supervisor extends Role {
	[EntityRepositoryType]?: SupervisorRepository

	@OneToMany(
		() => Course,
		(e) => e.supervisor
	)
	courses = new Collection<Course>(this)
}
