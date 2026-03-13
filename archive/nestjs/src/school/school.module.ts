import { MikroOrmModule } from "@mikro-orm/nestjs"
import { Module } from "@nestjs/common"
import { SchoolController } from "./school.controller"
import { School } from "./school.entity"
import { SchoolService } from "./school.service"

@Module({
	imports: [MikroOrmModule.forFeature({ entities: [School] })],
	controllers: [SchoolController],
	providers: [SchoolService],
})
export class SchoolModule {}
