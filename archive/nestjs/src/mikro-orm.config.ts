import { defineConfig, PostgreSqlDriver } from "@mikro-orm/postgresql"
import { TsMorphMetadataProvider } from "@mikro-orm/reflection"
import { OrgAdmin } from "./admin/OrgAdmin.entity"
import { SysAdmin } from "./admin/SysAdmin.entity"
import { BaseEntity } from "./baseEntity"
import { Classes } from "./classes/classes.entity"
import { Course } from "./course/course.entity"
import { Document } from "./documents/document.entity"
import { Hospital } from "./hospital/hospital.entity"
import { HospitalManager } from "./hospitalManager/hospitalManager.entity"
import { Organization } from "./organization/organization.abstract"
import { Preceptor } from "./preceptor/preceptor.entity"
import { Role } from "./role.abstract"
import { School } from "./school/school.entity"
import { Shift } from "./shift/shift.entity"
import { Student } from "./student/student.entity"
import { Supervisor } from "./supervisor/supervisor.entity"
import { User } from "./user/user.entity"

export default defineConfig({
	host: "10.0.0.2",
	port: 5432,
	user: "admin",
	password: "MySuperSecurePassword",
	dbName: "preceptoria",

	metadataProvider: TsMorphMetadataProvider,
	driver: PostgreSqlDriver,
	debug: true,

	entities: [
		BaseEntity,
		User,
		SysAdmin,
		OrgAdmin,
		Supervisor,
		HospitalManager,
		Preceptor,
		Student,
		Organization,
		Hospital,
		School,
		Course,
		Classes,
		Shift,
		Document,
		Role,
	],
})
