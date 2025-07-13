import {
	Entity,
	Enum,
	OneToOne,
	Property,
	type Rel,
} from "@mikro-orm/postgresql";
import {
	IsEmail,
	IsPhoneNumber,
	validateOrReject,
	IsNotEmpty,
} from "class-validator";

import { HospitalManager } from "../hospitalManager/hospitalManager.entity";
import { OrgAdmin } from "../admin/OrgAdmin.entity";
import { Preceptor } from "../preceptor/preceptor.entity";
import { UserRoles } from "../common/role.abstract";
import { Student } from "../students/student.entity";
import { Supervisor } from "../../entities/supervisor.entity";
import { SysAdmin } from "../admin/SysAdmin.entity";
import { BaseEntity } from "../common/baseEntity";

@Entity()
export class User extends BaseEntity {
	@Property()
	@IsNotEmpty()
	name: string;

	@Property({ hidden: true })
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@Property({ hidden: true })
	@IsPhoneNumber("BR")
	@IsNotEmpty()
	phoneNumber: string;

	@Property({ nullable: true })
	professionalIdentityNumber?: string;

	@Property({ hidden: true, lazy: true })
	passwordHash: string;

	@Enum({ default: [] })
	roles: UserRoles[] = [];

	@OneToOne(() => SysAdmin, (s) => s.user, { nullable: true })
	sysAdmin?: Rel<SysAdmin> = undefined;

	@OneToOne(() => OrgAdmin, (s) => s.user, { nullable: true })
	orgAdmin?: Rel<OrgAdmin> = undefined;

	@OneToOne(() => Supervisor, (s) => s.user, { nullable: true })
	supervisor?: Rel<Supervisor> = undefined;

	@OneToOne(() => HospitalManager, (s) => s.user, {
		nullable: true,
	})
	hospitalManager?: Rel<HospitalManager> = undefined;

	@OneToOne(() => Preceptor, (s) => s.user, { nullable: true })
	preceptor?: Rel<Preceptor> = undefined;

	@OneToOne(() => Student, (s) => s.user, { nullable: true })
	student?: Rel<Student> = undefined;

	private constructor(
		username: string,
		email: string,
		phoneNumber: string,
		password: string,
		professionalIdentityNumber?: string
	) {
		super();
		this.name = username;
		this.email = email;
		this.phoneNumber = phoneNumber;
		this.professionalIdentityNumber = professionalIdentityNumber;
		this.passwordHash = Bun.password.hashSync(password);
	}

	static async create(
		username: string,
		email: string,
		phoneNumber: string,
		password: string,
		professionalIdentityNumber?: string
	) {
		// Validate password before creating user
		if (!password || password.length < 6) {
			throw new Error("Password must be at least 6 characters long");
		}

		const user = new User(
			username,
			email,
			phoneNumber,
			password,
			professionalIdentityNumber
		);
		await validateOrReject(user);
		return user;
	}

	verifyPassword(password: string): boolean {
		return Bun.password.verifySync(password, this.passwordHash);
	}
}
