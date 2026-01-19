import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NivelProyectoService } from './nivel-proyecto.service';
import { NivelProyectoController } from './nivel-proyecto.controller';
import { NivelProyecto } from './entities/nivel-proyecto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NivelProyecto])],
  controllers: [NivelProyectoController],
  providers: [NivelProyectoService],
  exports: [NivelProyectoService],
})
export class NivelProyectoModule {}
