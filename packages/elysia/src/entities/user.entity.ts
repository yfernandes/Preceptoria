import {
	Entity,
	Enum,
	OneToOne,
	Property,
	type Rel,
} from "@mikro-orm/postgresql";
import { IsEmail, IsPhoneNumber, validateOrReject, IsNotEmpty, MinLength } from "class-validator";

import { HospitalManager } from "./hospitalManager.entity";
import { OrgAdmin } from "./OrgAdmin.entity";
import { Preceptor } from "./preceptor.entity";
import { UserRoles } from "./role.abstract";
import { Student } from "./student.entity";
import { Supervisor } from "./supervisor.entity";
import { SysAdmin } from "./SysAdmin.entity";
import { BaseEntity } from "./baseEntity";

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

	@Property({ hidden: true, lazy: true })
	passwordHash: string;

	@IsNotEmpty()
	@MinLength(6)
	private _password: string;

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
		password: string
	) {
		super();
		this.name = username;
		this.email = email;
		this.phoneNumber = phoneNumber;
		this._password = password;
		this.passwordHash = Bun.password.hashSync(password);
	}

	static async create(
		username: string,
		email: string,
		phoneNumber: string,
		password: string
	) {
		const user = new User(username, email, phoneNumber, password);
		await validateOrReject(user);
		return user;
	}
}
