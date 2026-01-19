import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proyecto } from './entities/proyecto.entity';
import { ProyectoService } from './proyecto.service';
import { ProyectoController } from './proyecto.controller';
import { NivelProyectoModule } from 'src/nivel-proyecto/nivel-proyecto.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proyecto]),
    NivelProyectoModule,
    CommonModule,
  ],
  controllers: [ProyectoController],
  providers: [ProyectoService],
})
export class ProyectoModule {}
