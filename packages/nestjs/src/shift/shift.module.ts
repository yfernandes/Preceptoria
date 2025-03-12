import { Module } from '@nestjs/common';
import { ShiftController } from './shift.controller';
import { ShiftService } from './shift.service';
import { Shift } from './shift.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Shift] })],
  controllers: [ShiftController],
  providers: [ShiftService],
})
export class ShiftModule {}
