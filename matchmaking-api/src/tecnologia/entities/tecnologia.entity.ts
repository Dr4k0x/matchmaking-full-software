import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { NivelProyecto } from '../../nivel-proyecto/entities/nivel-proyecto.entity';
import { NivelCarta } from '../../nivel-carta/entities/nivel-carta.entity';

@Entity('tecnologias')
export class Tecnologia {
  @PrimaryGeneratedColumn({ name: 'id_tecnologia' })
  idTecnologia: number;

  @Column({ type: 'integer', name: 'id_usuario' })
  idUsuario: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nombre: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tipo: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.tecnologias, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @OneToMany(() => NivelProyecto, (nivelProyecto) => nivelProyecto.tecnologia)
  nivelesProyecto: NivelProyecto[];

  @OneToMany(() => NivelCarta, (nivelCarta) => nivelCarta.tecnologia)
  nivelesCarta: NivelCarta[];
}
