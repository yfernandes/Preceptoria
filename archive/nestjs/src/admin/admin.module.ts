import { MikroOrmModule } from "@mikro-orm/nestjs"
import { Module } from "@nestjs/common"
import { AdminController } from "./admin.controller"
import { AdminService } from "./admin.service"
import { OrgAdmin } from "./OrgAdmin.entity"
import { SysAdmin } from "./SysAdmin.entity"

@Module({
	imports: [MikroOrmModule.forFeature({ entities: [SysAdmin, OrgAdmin] })],
	controllers: [AdminController],
	providers: [AdminService],
})
export class AdminModule {}
