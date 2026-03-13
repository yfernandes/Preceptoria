import { MikroOrmModule } from "@mikro-orm/nestjs"
import { Module } from "@nestjs/common"
import { ClassesController } from "./classes.controller"
import { Classes } from "./classes.entity"
import { ClassesService } from "./classes.service"

@Module({
	imports: [MikroOrmModule.forFeature({ entities: [Classes] })],
	controllers: [ClassesController],
	providers: [ClassesService],
})
export class ClassesModule {}
