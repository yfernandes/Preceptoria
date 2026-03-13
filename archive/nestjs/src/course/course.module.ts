import { MikroOrmModule } from "@mikro-orm/nestjs"
import { Module } from "@nestjs/common"
import { CourseController } from "./course.controller"
import { Course } from "./course.entity"
import { CourseService } from "./course.service"

@Module({
	imports: [MikroOrmModule.forFeature({ entities: [Course] })],
	controllers: [CourseController],
	providers: [CourseService],
})
export class CourseModule {}
