import { EntityRepository } from '@mikro-orm/postgresql';
import { Shift } from './shift.entity';

export class ShiftRepository extends EntityRepository<Shift> {}
