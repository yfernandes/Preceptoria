import { defineConfig, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

import { BaseEntity } from './baseEntity';
import { User } from './user/user.entity';
import { SysAdmin } from './admin/SysAdmin.entity';
import { OrgAdmin } from './admin/OrgAdmin.entity';
import { Supervisor } from './supervisor/supervisor.entity';
import { HospitalManager } from './hospitalManager/hospitalManager.entity';
import { Preceptor } from './preceptor/preceptor.entity';
import { Student } from './student/student.entity';
import { Organization } from './organization/organization.abstract';
import { Hospital } from './hospital/hospital.entity';
import { School } from './school/school.entity';
import { Course } from './course/course.entity';
import { Classes } from './classes/classes.entity';
import { Shift } from './shift/shift.entity';
import { Document } from './documents/document.entity';
import { Role } from './role.abstract';

export default defineConfig({
  host: '10.0.0.2',
  port: 5432,
  user: 'admin',
  password: 'MySuperSecurePassword',
  dbName: 'preceptoria',

  metadataProvider: TsMorphMetadataProvider,
  driver: PostgreSqlDriver,
  debug: true,

  entities: [
    BaseEntity,
    User,
    SysAdmin,
    OrgAdmin,
    Supervisor,
    HospitalManager,
    Preceptor,
    Student,
    Organization,
    Hospital,
    School,
    Course,
    Classes,
    Shift,
    Document,
    Role,
  ],
});
