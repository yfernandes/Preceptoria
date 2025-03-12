import {
	type Rel,
	Collection,
	Entity,
	ManyToOne,
	OneToMany,
} from "@mikro-orm/postgresql";

import { Course } from "./course.entity";
import { Role } from "./role.abstract";
import { School } from "./school.entity";
import { User } from "./user.entity";

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
