import type { User } from "@api/modules/users/user.entity"
import { OneToOne, type Rel } from "@mikro-orm/postgresql"
import { BaseEntity } from "./baseEntity"

export enum UserRoles {
	SysAdmin = "SysAdmin",
	OrgAdmin = "OrgAdmin",
	Supervisor = "Supervisor",
	HospitalManager = "HospitalManager",
	Preceptor = "Preceptor",
	Student = "Student",
}

export abstract class Role extends BaseEntity {
	@OneToOne("User")
	user: Rel<User>

	constructor(user: Rel<User>) {
		super()
		this.user = user
	}
}
