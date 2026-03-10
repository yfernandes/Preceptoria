import { Collection, Entity, OneToMany } from "@mikro-orm/postgresql";

import { OrgAdmin } from "@api/modules/admin/OrgAdmin.entity";
import { Shift } from "@api/modules/shifts/shift.entity";
import { Organization } from "@api/modules/common/organization.abstract";
import { HospitalManager } from "@api/modules/hospitalManagers/hospitalManager.entity";

@Entity()
export class Hospital extends Organization {
	@OneToMany(() => Shift, (e) => e.hospital)
	shifts = new Collection<Shift>(this);

	@OneToMany(() => HospitalManager, (e) => e.hospital)
	manager = new Collection<HospitalManager>(this);

	@OneToMany(() => OrgAdmin, (orgAdmin) => orgAdmin.hospital)
	orgAdmin = new Collection<OrgAdmin>(this);
}
