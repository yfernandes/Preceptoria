import { Collection, Entity, OneToMany } from "@mikro-orm/postgresql";

import {
	HospitalManager,
	OrgAdmin,
	Shift,
	Organization,
} from "@api/modules/entities";

@Entity()
export class Hospital extends Organization {
	@OneToMany(() => Shift, (e) => e.hospital)
	shifts = new Collection<Shift>(this);

	@OneToMany(() => HospitalManager, (e) => e.hospital)
	manager = new Collection<HospitalManager>(this);

	@OneToMany(() => OrgAdmin, (orgAdmin) => orgAdmin.hospital)
	orgAdmin = new Collection<OrgAdmin>(this);
}
