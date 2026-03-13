import { OptionalProps, BaseEntity as ORMBaseEntity, PrimaryKey, Property } from "@mikro-orm/core"
import { v6 } from "uuid"

export class BaseEntity extends ORMBaseEntity {
	[OptionalProps]?: "createdAt" | "updatedAt"

	@PrimaryKey({ type: "uuid" })
	id = v6()

	@Property()
	createdAt = new Date()

	@Property({ onUpdate: () => new Date() })
	updatedAt = new Date()
}
