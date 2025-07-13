import {
	type Rel,
	Collection,
	Entity,
	ManyToOne,
	OneToMany,
	Property,
} from "@mikro-orm/postgresql";

import { Hospital, Role, Shift, User } from "@api/modules/entities";

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
