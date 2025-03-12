import {
  Collection,
  Entity,
  EntityRepositoryType,
  OneToMany,
} from '@mikro-orm/core';
import { OrgAdmin } from 'src/admin/OrgAdmin.entity';
import { Course } from 'src/course/course.entity';
import { Organization } from 'src/organization/organization.abstract';
import { SchoolRepository } from './school.repository';

@Entity({ repository: () => SchoolRepository })
export class School extends Organization {
  [EntityRepositoryType]?: SchoolRepository;

  @OneToMany(() => OrgAdmin, (orgAdmin) => orgAdmin.school)
  orgAdmin = new Collection<OrgAdmin>(this);

  @OneToMany(() => Course, (course) => course.school)
  courses = new Collection<Course>(this);

  constructor(name: string, address: string, mail: string, phone: string) {
    super(name, address, mail, phone);
  }
}
