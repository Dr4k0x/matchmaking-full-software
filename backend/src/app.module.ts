import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ProyectoModule } from './proyecto/proyecto.module';
import { CartaModule } from './carta/carta.module';
import { TecnologiaModule } from './tecnologia/tecnologia.module';
import { MatchmakingModule } from './matchmaking/matchmaking.module';
import { NivelProyectoModule } from './nivel-proyecto/nivel-proyecto.module';
import { NivelCartaModule } from './nivel-carta/nivel-carta.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // SOLO DESARROLLO
    }),
    CommonModule,
    AuthModule,
    UsuariosModule,
    ProyectoModule,
    CartaModule,
    TecnologiaModule,
    MatchmakingModule,
    NivelProyectoModule,
    NivelCartaModule,
  ],
})
export class AppModule {}
