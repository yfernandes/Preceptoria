import { Entity, EntityRepositoryType } from '@mikro-orm/core';
import { SysAdminRepository } from './SysAdmin.repository';
import { Role } from 'src/role.abstract';

@Entity({ repository: () => SysAdminRepository })
export class SysAdmin extends Role {
  // Bestowed at birth with the powers of a GOD MUAHAUHAUHAUAHA
  [EntityRepositoryType]?: SysAdminRepository;
}
