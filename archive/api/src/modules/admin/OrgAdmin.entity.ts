import { type Rel, Entity, ManyToOne } from "@mikro-orm/postgresql";
import { Hospital } from "@api/modules/hospitals";
import { Role } from "@api/modules/common";
import { School } from "@api/modules/schools/school.entity";

@Entity()
export class OrgAdmin extends Role {
	@ManyToOne(() => Hospital, { nullable: true })
	hospital?: Rel<Hospital>;

	@ManyToOne(() => School, { nullable: true })
	school?: Rel<School>;
}
