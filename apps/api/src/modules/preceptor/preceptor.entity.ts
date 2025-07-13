import {
	type Rel,
	Collection,
	Entity,
	ManyToOne,
	OneToMany,
	Property,
} from "@mikro-orm/postgresql";

import { Hospital } from "@api/modules/hospital";
import { Role } from "@api/modules/common";
import { Shift } from "@api/modules/shift/shift.entity";
import { User } from "@api/modules/user/user.entity";

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
