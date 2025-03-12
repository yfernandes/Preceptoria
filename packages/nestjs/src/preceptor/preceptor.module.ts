import { Module } from '@nestjs/common';
import { PreceptorController } from './preceptor.controller';
import { PreceptorService } from './preceptor.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Preceptor } from './preceptor.entity';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Preceptor] })],
  controllers: [PreceptorController],
  providers: [PreceptorService],
})
export class PreceptorModule {}
