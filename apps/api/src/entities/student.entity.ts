import {
	type Rel,
	Collection,
	Entity,
	ManyToMany,
	ManyToOne,
	OneToMany,
} from "@mikro-orm/postgresql";

import { Classes } from "./classes.entity";
import { Role } from "./role.abstract";
import { Shift } from "./shift.entity";
import { User } from "./user.entity";
import { Document } from "../modules/documents";

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
