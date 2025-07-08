import { type Rel, Entity, ManyToOne } from "@mikro-orm/postgresql";
import { Hospital } from "./hospital.entity";
import { Role } from "./role.abstract";
import { School } from "./school.entity";

@Entity()
export class OrgAdmin extends Role {
	@ManyToOne(() => Hospital, { nullable: true })
	hospital?: Rel<Hospital>;

	@ManyToOne(() => School, { nullable: true })
	school?: Rel<School>;
}
