import {
	type Rel,
	Collection,
	Entity,
	ManyToOne,
	OneToMany,
	Property,
} from "@mikro-orm/postgresql";

import { BaseEntity } from "@api/modules/common/baseEntity";
import { Course } from "@api/modules/courses/course.entity";
import { Student } from "@api/modules/students/student.entity";

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
