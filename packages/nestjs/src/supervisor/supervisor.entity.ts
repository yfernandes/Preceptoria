import {
  Collection,
  Entity,
  EntityRepositoryType,
  OneToMany,
} from '@mikro-orm/core';
import { Course } from 'src/course/course.entity';
import { SupervisorRepository } from './supervisor.repository';
import { Role } from 'src/role.abstract';

@Entity({ repository: () => SupervisorRepository })
export class Supervisor extends Role {
  [EntityRepositoryType]?: SupervisorRepository;

  @OneToMany(() => Course, (e) => e.supervisor)
  courses = new Collection<Course>(this);
}
