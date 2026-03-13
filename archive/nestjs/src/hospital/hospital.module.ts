import { MikroOrmModule } from "@mikro-orm/nestjs"
import { Module } from "@nestjs/common"
import { HospitalController } from "./hospital.controller"
import { Hospital } from "./hospital.entity"
import { HospitalService } from "./hospital.service"

@Module({
	imports: [MikroOrmModule.forFeature({ entities: [Hospital] })],
	controllers: [HospitalController],
	providers: [HospitalService],
})
export class HospitalModule {}
