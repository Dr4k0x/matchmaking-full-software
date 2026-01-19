import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Carta } from '../../carta/entities/carta.entity';
import { Tecnologia } from '../../tecnologia/entities/tecnologia.entity';

@Entity('nivel_carta')
export class NivelCarta {
  @PrimaryGeneratedColumn({ name: 'id_nivel_carta' })
  idNivelCarta: number;

  @Column({ type: 'integer', name: 'id_carta' })
  idCarta: number;

  @Column({ type: 'integer', name: 'id_tecnologia' })
  idTecnologia: number;

  @Column({ type: 'integer', name: 'nivel_dominado', nullable: true })
  nivelDominado: number;

  @ManyToOne(() => Carta, (carta) => carta.nivelesCarta, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_carta' })
  carta: Carta;

  @ManyToOne(() => Tecnologia, (tecnologia) => tecnologia.nivelesCarta, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_tecnologia' })
  tecnologia: Tecnologia;
}
