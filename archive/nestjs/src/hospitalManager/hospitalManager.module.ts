import { MikroOrmModule } from "@mikro-orm/nestjs"
import { Module } from "@nestjs/common"
import { HospitalManagerController } from "./hospitalManager.controller"
import { HospitalManager } from "./hospitalManager.entity"
import { HospitalManagerService } from "./hospitalManager.service"

@Module({
	imports: [MikroOrmModule.forFeature({ entities: [HospitalManager] })],
	controllers: [HospitalManagerController],
	providers: [HospitalManagerService],
})
export class HospitalManagerModule {}
