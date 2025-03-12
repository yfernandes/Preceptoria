import {
  Entity,
  EntityRepositoryType,
  ManyToOne,
  type Rel,
} from '@mikro-orm/core';

import { OrgAdminRepository } from './OrgAdmin.repository';
import { Hospital } from 'src/hospital/hospital.entity';
import { School } from 'src/school/school.entity';
import { Role } from 'src/role.abstract';

@Entity({ repository: () => OrgAdminRepository })
export class OrgAdmin extends Role {
  [EntityRepositoryType]?: OrgAdminRepository;

  @ManyToOne(() => Hospital, { nullable: true })
  hospital?: Rel<Hospital>;

  @ManyToOne(() => School, { nullable: true })
  school?: Rel<School>;
}
