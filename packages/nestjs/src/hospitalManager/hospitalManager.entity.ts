import {
  Entity,
  EntityRepositoryType,
  ManyToOne,
  type Rel,
} from '@mikro-orm/core';
import { HospitalManagerRepository } from './hospitalManager.repository';
import { Role } from 'src/role.abstract';
import { Hospital } from 'src/hospital/hospital.entity';
import type { User } from 'src/user/user.entity';

@Entity({ repository: () => HospitalManagerRepository })
export class HospitalManager extends Role {
  [EntityRepositoryType]?: HospitalManagerRepository;

  @ManyToOne()
  hospital: Rel<Hospital>;

  constructor(user: User, hospital: Hospital) {
    super(user);
    this.hospital = hospital;
  }
}
