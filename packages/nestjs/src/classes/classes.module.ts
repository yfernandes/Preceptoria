import { Module } from '@nestjs/common';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { Classes } from './classes.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Classes] })],
  controllers: [ClassesController],
  providers: [ClassesService],
})
export class ClassesModule {}
