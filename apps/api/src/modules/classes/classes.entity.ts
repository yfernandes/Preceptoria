import {
	type Rel,
	Collection,
	Entity,
	ManyToOne,
	OneToMany,
	Property,
} from "@mikro-orm/postgresql";

import { Course } from "@api/entities/course.entity";
import { Student } from "@api/entities/student.entity";

import { BaseEntity } from "@api/entities/baseEntity";

@Entity()
export class Classes extends BaseEntity {
	@Property()
	name: string;

	@ManyToOne()
	course: Rel<Course>;

	@OneToMany(() => Student, (students) => students.class)
	students = new Collection<Student>(this);

	constructor(name: string, course: Rel<Course>) {
		super();
		this.name = name;
		this.course = course;
	}
}
