import { Property } from "@mikro-orm/postgresql";
import { IsEmail, IsPhoneNumber } from "class-validator";
import { BaseEntity } from "../modules/common/baseEntity";

export abstract class Organization extends BaseEntity {
	@Property()
	name: string;

	@Property()
	address: string;

	@Property()
	@IsEmail()
	email: string;

	@Property()
	@IsPhoneNumber("BR")
	phone: string;

	constructor(name: string, address: string, mail: string, phone: string) {
		super();

		this.name = name;
		this.address = address;
		this.email = mail;
		this.phone = phone;
	}
}
