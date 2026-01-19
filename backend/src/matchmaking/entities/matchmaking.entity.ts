import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Proyecto } from '../../proyecto/entities/proyecto.entity';
import { Carta } from '../../carta/entities/carta.entity';

@Entity('matchmaking')
export class Matchmaking {
  @PrimaryGeneratedColumn({ name: 'id_matchmaking' })
  idMatchmaking: number;

  @Column({ type: 'integer', name: 'id_proyecto', unique: true })
  idProyecto: number;

  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    name: 'resultado_porcentaje',
    nullable: true,
  })
  resultadoPorcentaje: number;

  @OneToOne(() => Proyecto, (proyecto) => proyecto.matchmaking, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_proyecto' })
  proyecto: Proyecto;

  @OneToMany(() => Carta, (carta) => carta.matchmaking)
  cartas: Carta[];
}
