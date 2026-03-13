import { MikroOrmModule } from "@mikro-orm/nestjs"
import { Module } from "@nestjs/common"
import { AdminModule } from "./admin/admin.module"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { ClassesModule } from "./classes/classes.module"
import { CourseModule } from "./course/course.module"
import { DocumentsModule } from "./documents/documents.module"
import { HospitalModule } from "./hospital/hospital.module"
import { HospitalManagerModule } from "./hospitalManager/hospitalManager.module"
import mikroOrmConfig from "./mikro-orm.config"
import { PreceptorModule } from "./preceptor/preceptor.module"
import { SchoolModule } from "./school/school.module"
import { ShiftModule } from "./shift/shift.module"
import { StudentModule } from "./student/student.module"
import { SupervisorModule } from "./supervisor/supervisor.module"
import { UserModule } from "./user/user.module"

@Module({
	imports: [
		MikroOrmModule.forRoot(mikroOrmConfig),
		DocumentsModule,
		HospitalModule,
		ClassesModule,
		CourseModule,
		PreceptorModule,
		SchoolModule,
		ShiftModule,
		StudentModule,
		SupervisorModule,
		UserModule,
		HospitalManagerModule,
		AdminModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
