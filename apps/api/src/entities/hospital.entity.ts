import { Collection, Entity, OneToMany } from "@mikro-orm/postgresql";

import { HospitalManager } from "./hospitalManager.entity";
import { OrgAdmin } from "../modules/admin/OrgAdmin.entity";
import { Organization } from "./organization.abstract";
import { Shift } from "./shift.entity";

@Entity()
export class Hospital extends Organization {
	@OneToMany(() => Shift, (e) => e.hospital)
	shifts = new Collection<Shift>(this);

	@OneToMany(() => HospitalManager, (e) => e.hospital)
	manager = new Collection<HospitalManager>(this);

	@OneToMany(() => OrgAdmin, (orgAdmin) => orgAdmin.hospital)
	orgAdmin = new Collection<OrgAdmin>(this);
}
