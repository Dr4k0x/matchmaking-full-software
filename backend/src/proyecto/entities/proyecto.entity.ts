import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Matchmaking } from '../../matchmaking/entities/matchmaking.entity';
import { NivelProyecto } from '../../nivel-proyecto/entities/nivel-proyecto.entity';

@Entity('proyectos')
export class Proyecto {
  @PrimaryGeneratedColumn({ name: 'id_proyecto' })
  idProyecto: number;

  @Column({ type: 'integer', name: 'id_usuario' })
  idUsuario: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'date', name: 'fecha_creacion', nullable: true })
  fechaCreacion: string;

  @Column({ type: 'date', name: 'fecha_finalizacion', nullable: true })
  fechaFinalizacion: string;


  @Column({ type: 'varchar', length: 50, nullable: true })
  estado: string;

  @Column({ type: 'integer', name: 'nivel_colaborativo', nullable: true })
  nivelColaborativo: number;

  @Column({ type: 'integer', name: 'nivel_organizativo', nullable: true })
  nivelOrganizativo: number;

  @Column({
    type: 'integer',
    name: 'nivel_velocidad_desarrollo',
    nullable: true,
  })
  nivelVelocidadDesarrollo: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.proyectos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @OneToOne(() => Matchmaking, (matchmaking) => matchmaking.proyecto, {
    cascade: true,
  })
  matchmaking: Matchmaking;

  @OneToMany(() => NivelProyecto, (nivelProyecto) => nivelProyecto.proyecto)
  nivelesProyecto: NivelProyecto[];
}
