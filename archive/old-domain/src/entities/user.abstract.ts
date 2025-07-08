import { Property } from "@mikro-orm/sqlite";
import { BaseEntity } from "./entities";

export enum UserRole {
	Admin = "admin",
	Supervisor = "supervisor",
	Teacher = "teacher",
	Student = "student",
}

export abstract class User extends BaseEntity {
	@Property()
	fullName: string;

	@Property()
	role: UserRole;

	@Property()
	cpf: string;

	@Property()
	phone: string;

	@Property()
	email: string;

	@Property()
	password?: string;

	constructor(
		fullName: string,
		role: UserRole,
		cpf: string,
		phone: string,
		email: string,
		password?: string
	) {
		super();
		this.fullName = fullName;
		this.role = role;
		this.cpf = cpf;
		this.phone = phone;
		this.email = email;
		this.password = password;
	}
}

export class Teacher extends User {}
