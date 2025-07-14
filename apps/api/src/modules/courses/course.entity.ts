import {
	type Rel,
	Collection,
	Entity,
	ManyToOne,
	OneToMany,
	Property,
} from "@mikro-orm/postgresql";

import { BaseEntity } from "@api/modules/common/";
import { Classes } from "@api/modules/classes/classes.entity";
import { School } from "@api/modules/schools/school.entity";
import { Supervisor } from "@api/modules/supervisors/supervisor.entity";

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
