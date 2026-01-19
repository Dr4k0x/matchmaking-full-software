import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MatchmakingController } from './matchmaking.controller';
import { MatchmakingService } from './matchmaking.service';

import { Matchmaking } from './entities/matchmaking.entity';
import { Proyecto } from '../proyecto/entities/proyecto.entity';
import { Carta } from '../carta/entities/carta.entity';
import { NivelProyecto } from '../nivel-proyecto/entities/nivel-proyecto.entity';
import { NivelCarta } from '../nivel-carta/entities/nivel-carta.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Matchmaking,
      Proyecto,
      Carta,
      NivelProyecto,
      NivelCarta,
    ]),
  ],
  controllers: [MatchmakingController],
  providers: [MatchmakingService],
})
export class MatchmakingModule {}
