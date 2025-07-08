import { Organization } from 'src/organization/organization.abstract';
import { Shift } from 'src/shift/shift.entity';
import { HospitalManager } from '../hospitalManager/hospitalManager.entity';
import {
  Collection,
  Entity,
  EntityRepositoryType,
  OneToMany,
} from '@mikro-orm/core';
import { OrgAdmin } from 'src/admin/OrgAdmin.entity';
import { HospitalRepository } from './hospital.repository';

@Entity({ repository: () => HospitalRepository })
export class Hospital extends Organization {
  [EntityRepositoryType]?: HospitalRepository;

  @OneToMany(() => Shift, (e) => e.hospital)
  shifts = new Collection<Shift>(this);

  @OneToMany(() => HospitalManager, (e) => e.hospital)
  manager = new Collection<HospitalManager>(this);

  @OneToMany(() => OrgAdmin, (orgAdmin) => orgAdmin.hospital)
  orgAdmin = new Collection<OrgAdmin>(this);

  constructor(name: string, address: string, mail: string, phone: string) {
    super(name, address, mail, phone);
  }
}
