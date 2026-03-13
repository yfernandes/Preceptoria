import { EntityRepository } from "@mikro-orm/postgresql"
import type { Student } from "./student.entity"

export class StudentRepository extends EntityRepository<Student> {}
