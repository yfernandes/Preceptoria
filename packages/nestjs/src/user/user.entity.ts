import { Entity, Enum, OneToOne, Property, type Rel } from '@mikro-orm/core';
import { IsEmail, IsPhoneNumber } from 'class-validator';

import { BaseEntity } from 'src/baseEntity';
import { Preceptor } from 'src/preceptor/preceptor.entity';
import { OrgAdmin } from 'src/admin/OrgAdmin.entity';
import { SysAdmin } from 'src/admin/SysAdmin.entity';
import { Student } from 'src/student/student.entity';
import { Supervisor } from 'src/supervisor/supervisor.entity';
import type { UserRoles } from 'src/role.abstract';
import { HospitalManager } from 'src/hospitalManager/hospitalManager.entity';

@Entity()
export class User extends BaseEntity {
  @Property()
  name: string;

  @Property({ hidden: true })
  @IsEmail()
  email: string;

  @Property({ hidden: true })
  @IsPhoneNumber('BR')
  phoneNumber: string;

  @Property({ hidden: true, lazy: true })
  passwordHash: string;

  @Enum({ default: [] })
  roles: UserRoles[] = [];

  @OneToOne(() => SysAdmin, (s) => s.user, { nullable: true })
  sysAdmin?: Rel<SysAdmin> = undefined;

  @OneToOne(() => OrgAdmin, (s) => s.user, { nullable: true })
  orgAdmin?: Rel<OrgAdmin> = undefined;

  @OneToOne(() => Supervisor, (s) => s.user, { nullable: true })
  supervisor?: Rel<Supervisor> = undefined;

  @OneToOne(() => HospitalManager, (s) => s.user, {
    nullable: true,
  })
  hospitalManager?: Rel<HospitalManager> = undefined;

  @OneToOne(() => Preceptor, (s) => s.user, { nullable: true })
  preceptor?: Rel<Preceptor> = undefined;

  @OneToOne(() => Student, (s) => s.user, { nullable: true })
  student?: Rel<Student> = undefined;

  constructor(
    username: string,
    email: string,
    phoneNumber: string,
    password: string,
  ) {
    super();
    this.name = username;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.passwordHash = Bun.password.hashSync(password);
  }
}
