import { EntityRepository } from '@mikro-orm/postgresql';
import { School } from './school.entity';

export class SchoolRepository extends EntityRepository<School> {}
