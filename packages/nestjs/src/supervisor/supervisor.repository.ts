import { EntityRepository } from '@mikro-orm/postgresql';
import { Supervisor } from './supervisor.entity';

export class SupervisorRepository extends EntityRepository<Supervisor> {}
