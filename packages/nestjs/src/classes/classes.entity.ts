import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToOne,
  OneToMany,
  Property,
  type Rel,
} from '@mikro-orm/core';
import { BaseEntity } from 'src/baseEntity';
import { Course } from 'src/course/course.entity';
import { Student } from 'src/student/student.entity';
import { ClassesRepository } from './classes.repository';

@Entity({ repository: () => ClassesRepository })
export class Classes extends BaseEntity {
  [EntityRepositoryType]?: ClassesRepository;

  @Property()
  name: string;

  @ManyToOne()
  course: Rel<Course>;

  @OneToMany(() => Student, (students) => students.class)
  students = new Collection<Student>(this);

  constructor(name: string, course: Rel<Course>) {
    super();
    this.name = name;
    this.course = course;
  }
}
