import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TecnologiaService } from './tecnologia.service';
import { TecnologiaController } from './tecnologia.controller';
import { Tecnologia } from './entities/tecnologia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tecnologia])],
  controllers: [TecnologiaController],
  providers: [TecnologiaService],
})
export class TecnologiaModule {}
