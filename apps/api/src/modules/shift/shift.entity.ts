import {
	type Rel,
	Collection,
	Entity,
	ManyToMany,
	ManyToOne,
	Property,
} from "@mikro-orm/postgresql";

import { BaseEntity } from "../common/baseEntity";

import { Hospital } from "@api/modules/hospital";
import { Preceptor } from "@api/modules/preceptor/";
import { Student } from "@api/modules/entities";

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
