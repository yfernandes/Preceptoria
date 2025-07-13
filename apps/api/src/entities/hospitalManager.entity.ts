import { type Rel, Entity, ManyToOne } from "@mikro-orm/postgresql";

import { Hospital } from "./hospital.entity";
import { Role } from "../modules/common/role.abstract";
import { User } from "./user.entity";

@Entity()
export class HospitalManager extends Role {
	@ManyToOne()
	hospital: Rel<Hospital>;

	constructor(user: Rel<User>, hospital: Rel<Hospital>) {
		super(user);
		this.hospital = hospital;
	}
}
