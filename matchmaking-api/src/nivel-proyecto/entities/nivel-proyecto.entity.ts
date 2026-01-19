import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Proyecto } from '../../proyecto/entities/proyecto.entity';
import { Tecnologia } from '../../tecnologia/entities/tecnologia.entity';

@Entity('nivel_proyecto')
export class NivelProyecto {
  @PrimaryGeneratedColumn({ name: 'id_nivel_proyecto' })
  idNivelProyecto: number;

  @Column({ type: 'integer', name: 'id_proyecto' })
  idProyecto: number;

  @Column({ type: 'integer', name: 'id_tecnologia' })
  idTecnologia: number;

  @Column({ type: 'integer', name: 'nivel_requerido', nullable: true })
  nivelRequerido: number;

  @ManyToOne(() => Proyecto, (proyecto) => proyecto.nivelesProyecto, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_proyecto' })
  proyecto: Proyecto;

  @ManyToOne(() => Tecnologia, (tecnologia) => tecnologia.nivelesProyecto, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_tecnologia' })
  tecnologia: Tecnologia;
}
