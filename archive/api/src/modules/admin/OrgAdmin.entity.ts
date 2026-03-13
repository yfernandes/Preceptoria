import { Role } from "@api/modules/common"
import { Hospital } from "@api/modules/hospitals"
import { School } from "@api/modules/schools/school.entity"
import { Entity, ManyToOne, type Rel } from "@mikro-orm/postgresql"

@Entity()
export class OrgAdmin extends Role {
	@ManyToOne(() => Hospital, { nullable: true })
	hospital?: Rel<Hospital>

	@ManyToOne(() => School, { nullable: true })
	school?: Rel<School>
}
