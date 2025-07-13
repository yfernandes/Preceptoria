import {
	type Rel,
	Collection,
	Entity,
	ManyToMany,
	ManyToOne,
	OneToMany,
} from "@mikro-orm/postgresql";

import { Classes } from "@api/modules/classes";
import { Role } from "@api/modules/common/role.abstract";
import { Shift } from "@api/modules/shift/shift.entity";
import { User } from "@api/entities/user.entity";
import { Document } from "@api/modules/documents";

@Entity()
export class Student extends Role {
	@OneToMany(() => Document, (document) => document.student)
	documents = new Collection<Document>(this);

	@ManyToOne(() => Classes)
	class: Rel<Classes>;

	@ManyToMany()
	shifts = new Collection<Shift>(this);

	constructor(user: Rel<User>, classes: Rel<Classes>) {
		super(user);
		this.class = classes;
	}
}
