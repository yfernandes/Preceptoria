import { MikroOrmModule } from "@mikro-orm/nestjs"
import { Module } from "@nestjs/common"
import { PreceptorController } from "./preceptor.controller"
import { Preceptor } from "./preceptor.entity"
import { PreceptorService } from "./preceptor.service"

@Module({
	imports: [MikroOrmModule.forFeature({ entities: [Preceptor] })],
	controllers: [PreceptorController],
	providers: [PreceptorService],
})
export class PreceptorModule {}
