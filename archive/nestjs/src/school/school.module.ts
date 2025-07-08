import { Module } from '@nestjs/common';
import { SchoolController } from './school.controller';
import { SchoolService } from './school.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { School } from './school.entity';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [School] })],
  controllers: [SchoolController],
  providers: [SchoolService],
})
export class SchoolModule {}
