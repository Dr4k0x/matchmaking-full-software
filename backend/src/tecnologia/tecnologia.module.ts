import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TecnologiaService } from './tecnologia.service';
import { TecnologiaController } from './tecnologia.controller';
import { Tecnologia } from './entities/tecnologia.entity';
import { NivelCarta } from '../nivel-carta/entities/nivel-carta.entity';
import { NivelProyecto } from '../nivel-proyecto/entities/nivel-proyecto.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Tecnologia, NivelCarta, NivelProyecto])],
  controllers: [TecnologiaController],
  providers: [TecnologiaService],
})
export class TecnologiaModule {}
