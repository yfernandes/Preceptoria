import {
	type Rel,
	Collection,
	Entity,
	ManyToMany,
	ManyToOne,
	Property,
} from "@mikro-orm/postgresql";

import { BaseEntity } from "./baseEntity";

import { Hospital } from "./hospital.entity";
import { Preceptor } from "./preceptor.entity";
import { Student } from "./student.entity";

@Entity()
export class Shift extends BaseEntity {
	@Property()
	date: Date;

	@Property()
	startTime: Date;

	@Property()
	endTime: Date;

	@Property()
	location: string;

	@ManyToOne()
	hospital: Rel<Hospital>;

	@ManyToOne()
	preceptor: Rel<Preceptor>;

	@ManyToMany()
	students = new Collection<Student>(this);

	constructor(
		date: Date,
		startTime: Date,
		endTime: Date,
		location: string,
		hospital: Rel<Hospital>,
		preceptor: Rel<Preceptor>
	) {
		super();

		this.date = date;
		this.startTime = startTime;
		this.endTime = endTime;
		this.location = location;
		this.hospital = hospital;
		this.preceptor = preceptor;
	}
}
