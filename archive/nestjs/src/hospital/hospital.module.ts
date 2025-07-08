import { Module } from '@nestjs/common';
import { HospitalController } from './hospital.controller';
import { HospitalService } from './hospital.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Hospital } from './hospital.entity';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Hospital] })],
  controllers: [HospitalController],
  providers: [HospitalService],
})
export class HospitalModule {}
