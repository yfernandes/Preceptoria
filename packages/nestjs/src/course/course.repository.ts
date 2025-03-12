import { EntityRepository } from '@mikro-orm/postgresql';
import { Course } from './course.entity';

export class CourseRepository extends EntityRepository<Course> {}
