import { EntityRepository } from '@mikro-orm/postgresql';
import { HospitalManager } from './hospitalManager.entity';

export class HospitalManagerRepository extends EntityRepository<HospitalManager> {}
