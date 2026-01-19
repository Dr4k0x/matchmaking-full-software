import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Carta } from './entities/carta.entity';
import { CartaService } from './carta.service';
import { CartaController } from './carta.controller';
import { NivelCartaModule } from '../nivel-carta/nivel-carta.module';

@Module({
  imports: [TypeOrmModule.forFeature([Carta]), NivelCartaModule],
  controllers: [CartaController],
  providers: [CartaService],
  exports: [CartaService], // Export CartaService just in case it's needed elsewhere (like Matchmaking)
})
export class CartaModule { }
