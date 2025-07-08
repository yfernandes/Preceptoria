import { EntityRepository } from '@mikro-orm/postgresql';
import { SysAdmin } from './SysAdmin.entity';

export class SysAdminRepository extends EntityRepository<SysAdmin> {}
