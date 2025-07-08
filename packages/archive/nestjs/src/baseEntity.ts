import { OptionalProps, PrimaryKey, Property } from '@mikro-orm/core';
import { v6 } from 'uuid';
import { BaseEntity as ORMBaseEntity } from '@mikro-orm/core';

export class BaseEntity extends ORMBaseEntity {
  [OptionalProps]?: 'createdAt' | 'updatedAt';

  @PrimaryKey({ type: 'uuid' })
  id = v6();

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();
}
