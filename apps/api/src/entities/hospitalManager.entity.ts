import { type Rel, Entity, ManyToOne } from "@mikro-orm/postgresql";

import { Hospital } from "@api/modules/hospital";
import { Role } from "@api/modules/common";
import { User } from "@api/entities/user.entity";

@Entity()
export class HospitalManager extends Role {
	@ManyToOne()
	hospital: Rel<Hospital>;

	constructor(user: Rel<User>, hospital: Rel<Hospital>) {
		super(user);
		this.hospital = hospital;
	}
}
