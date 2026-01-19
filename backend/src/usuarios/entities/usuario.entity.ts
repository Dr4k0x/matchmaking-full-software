import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Proyecto } from '../../proyecto/entities/proyecto.entity';
import { Carta } from '../../carta/entities/carta.entity';
import { Tecnologia } from '../../tecnologia/entities/tecnologia.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'id_usuario' })
  idUsuario: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'passkey' })
  passkey: string;

  @OneToMany(() => Proyecto, (proyecto) => proyecto.usuario)
  proyectos?: Proyecto[];

  @OneToMany(() => Carta, (carta) => carta.usuario)
  cartas?: Carta[];

  @OneToMany(() => Tecnologia, (tecnologia) => tecnologia.usuario)
  tecnologias?: Tecnologia[];
}
