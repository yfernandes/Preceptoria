import { Module } from '@nestjs/common';
import { DocumentsController } from './document.controller';
import { DocumentService } from './document.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Document } from './document.entity';

@Module({
  controllers: [DocumentsController],
  imports: [MikroOrmModule.forFeature({ entities: [Document] })],
  providers: [DocumentService],
})
export class DocumentsModule {}
