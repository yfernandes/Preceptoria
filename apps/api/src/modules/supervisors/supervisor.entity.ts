import {
	type Rel,
	Collection,
	Entity,
	ManyToOne,
	OneToMany,
} from "@mikro-orm/postgresql";

import { Course } from "../courses/course.entity";
import { Role } from "../common/role.abstract";
import { School } from "../schools/school.entity";
import { User } from "../users/user.entity";

@Entity()
export class Supervisor extends Role {
	@ManyToOne(() => School)
	school: Rel<School>;

	@OneToMany(() => Course, (e) => e.supervisor)
	courses = new Collection<Course>(this);

	constructor(user: Rel<User>, school: Rel<School>) {
		super(user);
		this.school = school;
	}
}
