import { EntityRepository } from '@mikro-orm/postgresql';
import { Student } from './student.entity';

export class StudentRepository extends EntityRepository<Student> {}
