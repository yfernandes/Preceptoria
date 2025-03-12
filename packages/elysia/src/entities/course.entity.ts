import {
	type Rel,
	Collection,
	Entity,
	ManyToOne,
	OneToMany,
	Property,
} from "@mikro-orm/postgresql";

import { BaseEntity } from "./baseEntity";

import { Classes } from "./classes.entity";
import { School } from "./school.entity";
import { Supervisor } from "./supervisor.entity";

@Entity()
export class Course extends BaseEntity {
	@Property()
	name: string;

	@ManyToOne()
	school: Rel<School>;

	@OneToMany(() => Classes, (e) => e.course)
	classes = new Collection<Classes>(this);

	@ManyToOne()
	supervisor: Rel<Supervisor>;

	constructor(name: string, school: Rel<School>, supervisor: Rel<Supervisor>) {
		super();
		this.name = name;
		this.school = school;
		this.supervisor = supervisor;
	}
}
