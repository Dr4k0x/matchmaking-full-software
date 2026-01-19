import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Matchmaking } from '../../matchmaking/entities/matchmaking.entity';
import { NivelCarta } from '../../nivel-carta/entities/nivel-carta.entity';

@Entity('cartas')
export class Carta {
  @PrimaryGeneratedColumn()
  idCarta: number;

  @Column({ name: 'nombre_apellido' })
  nombreApellido: string;

  @Column({ name: 'cedula_identidad' })
  cedulaIdentidad: string;

  @Column({ name: 'tipo_carta' })
  tipoCarta: string;

  @Column({ name: 'poder_social' })
  poderSocial: number;

  @Column()
  sabiduria: number;

  @Column()
  velocidad: number;

  // 🔗 FK → Usuario (obligatoria)
  @ManyToOne(() => Usuario, (usuario) => usuario.cartas, { nullable: false })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  // 🔗 FK → Matchmaking (opcional)
  @ManyToOne(() => Matchmaking, (matchmaking) => matchmaking.cartas, {
    nullable: true,
  })
  @JoinColumn({ name: 'id_matchmaking' })
  matchmaking?: Matchmaking;

  @OneToMany(() => NivelCarta, (nivelCarta) => nivelCarta.carta)
  nivelesCarta: NivelCarta[];
}
