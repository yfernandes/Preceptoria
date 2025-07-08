import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Course } from './course.entity';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Course] })],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
