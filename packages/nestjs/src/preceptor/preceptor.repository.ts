import { EntityRepository } from '@mikro-orm/postgresql';
import { Preceptor } from './preceptor.entity';

export class PreceptorRepository extends EntityRepository<Preceptor> {}
