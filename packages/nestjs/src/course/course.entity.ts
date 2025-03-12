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
import { Classes } from 'src/classes/classes.entity';
import { School } from 'src/school/school.entity';
import { Supervisor } from 'src/supervisor/supervisor.entity';
import { CourseRepository } from './course.repository';

@Entity({ repository: () => CourseRepository })
export class Course extends BaseEntity {
  [EntityRepositoryType]?: CourseRepository;

  @Property()
  name: string;

  @ManyToOne()
  school: Rel<School>;

  @OneToMany(() => Classes, (e) => e.course)
  classes = new Collection<Classes>(this);

  @ManyToOne()
  supervisor: Rel<Supervisor>;

  constructor(name: string, school: Rel<School>, supervisor: Rel<Supervisor>) {
    super();
    this.name = name;
    this.school = school;
    this.supervisor = supervisor;
  }
}
