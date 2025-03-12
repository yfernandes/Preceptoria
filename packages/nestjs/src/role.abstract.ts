import { OneToOne, type Rel } from '@mikro-orm/core';
import { BaseEntity } from './baseEntity';
import { User } from './user/user.entity';

export enum UserRoles {
  SysAdmin = 'SysAdmin',
  OrgAdmin = 'OrgAdmin',
  Supervisor = 'Supervisor',
  HospitalManager = 'HospitalManager',
  Preceptor = 'Preceptor',
  Student = 'Student',
}

export abstract class Role extends BaseEntity {
  @OneToOne('user')
  user: Rel<User>;

  constructor(user: User) {
    super();
    this.user = user;
  }
}
