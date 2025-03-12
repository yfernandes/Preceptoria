import { EntityRepository } from '@mikro-orm/postgresql';
import { Classes } from './classes.entity';

export class ClassesRepository extends EntityRepository<Classes> {}
