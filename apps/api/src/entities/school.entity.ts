import { Collection, Entity, OneToMany } from "@mikro-orm/postgresql";

import { Course } from "../modules/courses/course.entity";
import { OrgAdmin } from "../modules/admin/OrgAdmin.entity";
import { Organization } from "./organization.abstract";
import { Supervisor } from "./supervisor.entity";

@Entity()
export class School extends Organization {
	@OneToMany(() => OrgAdmin, (orgAdmin) => orgAdmin.school)
	orgAdmin = new Collection<OrgAdmin>(this);

	@OneToMany(() => Course, (course) => course.school)
	courses = new Collection<Course>(this);

	@OneToMany(() => Supervisor, (e) => e.school)
	supervisors = new Collection<Supervisor>(this);
}
