import { type Rel, Entity, ManyToOne } from "@mikro-orm/postgresql";
import { Hospital } from "@api/modules/hospital";
import { Role } from "@api/modules/common";
import { School } from "@api/modules/school/school.entity";

@Entity()
export class OrgAdmin extends Role {
	@ManyToOne(() => Hospital, { nullable: true })
	hospital?: Rel<Hospital>;

	@ManyToOne(() => School, { nullable: true })
	school?: Rel<School>;
}
