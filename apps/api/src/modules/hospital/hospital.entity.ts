import { Collection, Entity, OneToMany } from "@mikro-orm/postgresql";

import { HospitalManager } from "@api/modules/hospitalManager/hospitalManager.entity";
import { OrgAdmin } from "@api/modules/admin";
import { Organization } from "@api/modules/common/organization.abstract";
import { Shift } from "@api/modules/shift/shift.entity";

@Entity()
export class Hospital extends Organization {
	@OneToMany(() => Shift, (e) => e.hospital)
	shifts = new Collection<Shift>(this);

	@OneToMany(() => HospitalManager, (e) => e.hospital)
	manager = new Collection<HospitalManager>(this);

	@OneToMany(() => OrgAdmin, (orgAdmin) => orgAdmin.hospital)
	orgAdmin = new Collection<OrgAdmin>(this);
}
