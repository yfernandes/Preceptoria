import { BaseEntity } from "@api/modules/common/baseEntity"
import type { Hospital } from "@api/modules/hospitals/hospital.entity"
import type { Preceptor } from "@api/modules/preceptors/preceptor.entity"
import type { Student } from "@api/modules/students/student.entity"
import {
	Collection,
	Entity,
	ManyToMany,
	ManyToOne,
	Property,
	type Rel,
} from "@mikro-orm/postgresql"

@Entity()
export class Shift extends BaseEntity {
	@Property()
	date: Date

	@Property()
	startTime: Date

	@Property()
	endTime: Date

	@Property()
	location: string

	@ManyToOne()
	hospital: Rel<Hospital>

	@ManyToOne()
	preceptor: Rel<Preceptor>

	@ManyToMany()
	students = new Collection<Student>(this)

	constructor(
		date: Date,
		startTime: Date,
		endTime: Date,
		location: string,
		hospital: Rel<Hospital>,
		preceptor: Rel<Preceptor>
	) {
		super()

		this.date = date
		this.startTime = startTime
		this.endTime = endTime
		this.location = location
		this.hospital = hospital
		this.preceptor = preceptor
	}
}
