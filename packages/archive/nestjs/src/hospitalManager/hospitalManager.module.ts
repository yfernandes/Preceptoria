import { Module } from '@nestjs/common';
import { HospitalManagerService } from './hospitalManager.service';
import { HospitalManagerController } from './hospitalManager.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { HospitalManager } from './hospitalManager.entity';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [HospitalManager] })],
  controllers: [HospitalManagerController],
  providers: [HospitalManagerService],
})
export class HospitalManagerModule {}
