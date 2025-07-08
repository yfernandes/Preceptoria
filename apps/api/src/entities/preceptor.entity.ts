import {
	type Rel,
	Collection,
	Entity,
	ManyToOne,
	OneToMany,
	Property,
} from "@mikro-orm/postgresql";

import { Hospital } from "./hospital.entity";
import { Role } from "./role.abstract";
import { Shift } from "./shift.entity";
import { User } from "./user.entity";

@Entity()
export class Preceptor extends Role {
	@ManyToOne(() => Hospital)
	hospital: Hospital;

	@OneToMany(() => Shift, (e) => e.preceptor)
	shifts = new Collection<Shift>(this);

	@Property()
	specialty!: string;

	@Property()
	licenseNumber!: string;

	constructor(user: Rel<User>, hospital: Rel<Hospital>) {
		super(user);
		this.hospital = hospital;
	}
}
