import { EntityRepository } from '@mikro-orm/postgresql';
import { Hospital } from './hospital.entity';

export class HospitalRepository extends EntityRepository<Hospital> {}
