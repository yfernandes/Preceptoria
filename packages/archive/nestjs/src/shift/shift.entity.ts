import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToMany,
  ManyToOne,
  Property,
  type Rel,
} from '@mikro-orm/core';
import { BaseEntity } from 'src/baseEntity';
import { Hospital } from 'src/hospital/hospital.entity';
import { Preceptor } from 'src/preceptor/preceptor.entity';
import { Student } from 'src/student/student.entity';
import { ShiftRepository } from './shift.repository';

@Entity({ repository: () => ShiftRepository })
export class Shift extends BaseEntity {
  [EntityRepositoryType]?: ShiftRepository;

  @Property()
  date: Date;

  @Property()
  startTime: Date;

  @Property()
  endTime: Date;

  @Property()
  location: string;

  @ManyToOne()
  hospital: Rel<Hospital>;

  @ManyToOne()
  preceptor: Rel<Preceptor>;

  @ManyToMany()
  students = new Collection<Student>(this);

  constructor(
    date: Date,
    startTime: Date,
    endTime: Date,
    location: string,
    hospital: Rel<Hospital>,
    preceptor: Rel<Preceptor>,
  ) {
    super();

    this.date = date;
    this.startTime = startTime;
    this.endTime = endTime;
    this.location = location;
    this.hospital = hospital;
    this.preceptor = preceptor;
  }
}
