import { type Rel, Entity, ManyToOne } from "@mikro-orm/postgresql";

import { Hospital, Role, User } from "@api/modules/entities";

@Entity()
export class HospitalManager extends Role {
	@ManyToOne()
	hospital: Rel<Hospital>;

	constructor(user: Rel<User>, hospital: Rel<Hospital>) {
		super(user);
		this.hospital = hospital;
	}
}
