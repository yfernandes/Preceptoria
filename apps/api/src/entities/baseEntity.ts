import {
	OptionalProps,
	PrimaryKey,
	Property,
	BaseEntity as ORMBaseEntity,
} from "@mikro-orm/postgresql";

export class BaseEntity extends ORMBaseEntity {
	[OptionalProps]?: "createdAt" | "updatedAt";

	@PrimaryKey({ type: "uuid" })
	id = Bun.randomUUIDv7();

	@Property()
	createdAt = new Date();

	@Property({ onUpdate: () => new Date() })
	updatedAt = new Date();
}
