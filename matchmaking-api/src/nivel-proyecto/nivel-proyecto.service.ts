import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { CreateNivelProyectoDto } from './dto/create-nivel-proyecto.dto';
import { CreateManyNivelProyectoDto } from './dto/create-many-nivel-proyecto.dto';
import { UpdateNivelProyectoDto } from './dto/update-nivel-proyecto.dto';
import { FindNivelProyectoDto } from './dto/find-nivel-proyecto.dto';
import { NivelProyecto } from './entities/nivel-proyecto.entity';

@Injectable()
export class NivelProyectoService {
  constructor(
    @InjectRepository(NivelProyecto)
    private readonly nivelProyectoRepository: Repository<NivelProyecto>,
  ) {}

  async create(createNivelProyectoDto: CreateNivelProyectoDto) {
    try {
      const nivelProyecto = this.nivelProyectoRepository.create({
        ...createNivelProyectoDto,
      });
      await this.nivelProyectoRepository.save(nivelProyecto);
      return { message: 'Nivel de proyecto creado correctamente' };
    } catch {
      throw new InternalServerErrorException(
        'Error al crear el nivel de proyecto',
      );
    }
  }

  async createMany(
    createManyNivelProyectoDto: CreateManyNivelProyectoDto,
    idProyecto: number,
    manager?: EntityManager,
  ) {
    try {
      const nivelesToInsert = createManyNivelProyectoDto.niveles.map(
        (nivel) => ({
          idProyecto: idProyecto,
          idTecnologia: nivel.idTecnologia,
          nivelRequerido: nivel.nivelRequerido,
        }),
      );

      const repository = manager
        ? manager.getRepository(NivelProyecto)
        : this.nivelProyectoRepository;

      await repository.insert(nivelesToInsert);

      return {
        message: `${nivelesToInsert.length} niveles de proyecto creados correctamente para el proyecto ${idProyecto}`,
        count: nivelesToInsert.length,
      };
    } catch {
      throw new InternalServerErrorException(
        'Error al crear los niveles de proyecto',
      );
    }
  }

  async findAll(query: FindNivelProyectoDto) {
    const { idProyecto, nivelRequerido, nombre, tipo } = query;

    const queryBuilder = this.nivelProyectoRepository
      .createQueryBuilder('nivelProyecto')
      .leftJoinAndSelect('nivelProyecto.tecnologia', 'tecnologia');

    if (idProyecto) {
      queryBuilder.andWhere('nivelProyecto.idProyecto = :idProyecto', {
        idProyecto,
      });
    }

    if (nivelRequerido) {
      queryBuilder.andWhere('nivelProyecto.nivelRequerido = :nivelRequerido', {
        nivelRequerido,
      });
    }

    if (nombre) {
      queryBuilder.andWhere('tecnologia.nombre LIKE :nombre', {
        nombre: `%${nombre}%`,
      });
    }

    if (tipo) {
      queryBuilder.andWhere('tecnologia.tipo LIKE :tipo', {
        tipo: `%${tipo}%`,
      });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number) {
    const nivelProyecto = await this.nivelProyectoRepository.findOne({
      where: { idNivelProyecto: id },
      relations: ['tecnologia'],
    });

    if (!nivelProyecto) {
      throw new NotFoundException(
        `Nivel de proyecto con id ${id} no encontrado`,
      );
    }

    return nivelProyecto;
  }

  async update(id: number, updateNivelProyectoDto: UpdateNivelProyectoDto) {
    try {
      await this.nivelProyectoRepository.update(id, updateNivelProyectoDto);
      return { message: 'Nivel de proyecto actualizado correctamente' };
    } catch {
      throw new InternalServerErrorException(
        'Error al actualizar el nivel de proyecto',
      );
    }
  }

  async remove(id: number) {
    try {
      await this.nivelProyectoRepository.delete(id);
      return { message: 'Nivel de proyecto eliminado correctamente' };
    } catch {
      throw new InternalServerErrorException(
        'Error al eliminar el nivel de proyecto',
      );
    }
  }
}
