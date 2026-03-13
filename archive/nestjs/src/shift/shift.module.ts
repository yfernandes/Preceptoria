import { MikroOrmModule } from "@mikro-orm/nestjs"
import { Module } from "@nestjs/common"
import { ShiftController } from "./shift.controller"
import { Shift } from "./shift.entity"
import { ShiftService } from "./shift.service"

@Module({
	imports: [MikroOrmModule.forFeature({ entities: [Shift] })],
	controllers: [ShiftController],
	providers: [ShiftService],
})
export class ShiftModule {}
