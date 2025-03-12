import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { SysAdmin } from './SysAdmin.entity';
import { OrgAdmin } from './OrgAdmin.entity';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [SysAdmin, OrgAdmin] })],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
