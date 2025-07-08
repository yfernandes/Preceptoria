import { Module } from '@nestjs/common';
import { SupervisorController } from './supervisor.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Supervisor } from './supervisor.entity';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Supervisor] })],
  controllers: [SupervisorController],
})
export class SupervisorModule {}
