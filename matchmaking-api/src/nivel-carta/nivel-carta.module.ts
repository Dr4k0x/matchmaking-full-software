import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NivelCartaService } from './nivel-carta.service';
import { NivelCartaController } from './nivel-carta.controller';
import { NivelCarta } from './entities/nivel-carta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NivelCarta])],
  controllers: [NivelCartaController],
  providers: [NivelCartaService],
  exports: [NivelCartaService],
})
export class NivelCartaModule {}
