import { MikroOrmModule } from "@mikro-orm/nestjs"
import { Module } from "@nestjs/common"
import { DocumentsController } from "./document.controller"
import { Document } from "./document.entity"
import { DocumentService } from "./document.service"

@Module({
	controllers: [DocumentsController],
	imports: [MikroOrmModule.forFeature({ entities: [Document] })],
	providers: [DocumentService],
})
export class DocumentsModule {}
