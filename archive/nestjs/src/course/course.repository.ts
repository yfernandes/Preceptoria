import { EntityRepository } from "@mikro-orm/postgresql"
import type { Course } from "./course.entity"

export class CourseRepository extends EntityRepository<Course> {}
