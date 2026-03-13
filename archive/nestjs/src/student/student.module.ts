import { MikroOrmModule } from "@mikro-orm/nestjs"
import { Module } from "@nestjs/common"
import { StudentController } from "./student.controller"
import { Student } from "./student.entity"
import { StudentService } from "./student.service"

@Module({
	imports: [MikroOrmModule.forFeature({ entities: [Student] })],
	controllers: [StudentController],
	providers: [StudentService],
})
export class StudentModule {}
