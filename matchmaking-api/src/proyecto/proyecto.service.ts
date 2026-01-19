import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { FindProyectoDto } from './dto/find-proyecto.dto';
import { Proyecto } from './entities/proyecto.entity';
import { JwtPayload } from 'src/auth/jwt-payload.interface';
import { NivelProyectoService } from 'src/nivel-proyecto/nivel-proyecto.service';
import { TransactionService } from 'src/common/transaction.service';

@Injectable()
export class ProyectoService {
  constructor(
    @InjectRepository(Proyecto)
    private readonly proyectoRepository: Repository<Proyecto>,
    private readonly nivelProyectoService: NivelProyectoService,
    private readonly transactionService: TransactionService,
  ) {}

  async create(createProyectoDto: CreateProyectoDto, user: JwtPayload) {
    try {
      return await this.transactionService.runInTransaction(
        async (manager: EntityManager) => {
          const proyecto = manager.getRepository(Proyecto).create({
            ...createProyectoDto,
            idUsuario: user.sub,
          });

          const savedProyecto = await manager
            .getRepository(Proyecto)
            .save(proyecto);

          if (Array.isArray(createProyectoDto?.niveles)) {
            await this.nivelProyectoService.createMany(
              { niveles: createProyectoDto.niveles },
              savedProyecto.idProyecto,
              manager,
            );
          }

          return { message: 'Proyecto creado correctamente' };
        },
      );
    } catch {
      throw new InternalServerErrorException('Error al crear el proyecto');
    }
  }

  async findAll(user: JwtPayload, filters?: FindProyectoDto) {
    const hasTecnologiaFilters =
      filters?.nombreTecnologia || filters?.tipoTecnologia;

    const queryBuilder = this.proyectoRepository
      .createQueryBuilder('proyecto')
      .where('proyecto.idUsuario = :idUsuario', { idUsuario: user.sub });

    if (hasTecnologiaFilters) {
      queryBuilder
        .innerJoin('proyecto.nivelesProyecto', 'nivelesProyecto')
        .innerJoin('nivelesProyecto.tecnologia', 'tecnologia');
    } else {
      queryBuilder
        .leftJoinAndSelect('proyecto.nivelesProyecto', 'nivelesProyecto')
        .leftJoinAndSelect('nivelesProyecto.tecnologia', 'tecnologia');
    }

    if (filters?.nombreProyecto) {
      queryBuilder.andWhere('proyecto.nombre ILIKE :nombreProyecto', {
        nombreProyecto: `%${filters.nombreProyecto}%`,
      });
    }

    if (filters?.fechaCreacion) {
      queryBuilder.andWhere('proyecto.fechaCreacion = :fechaCreacion', {
        fechaCreacion: filters.fechaCreacion,
      });
    }

    if (filters?.fechaFinalizacion) {
      queryBuilder.andWhere('proyecto.fechaFinalizacion = :fechaFinalizacion', {
        fechaFinalizacion: filters.fechaFinalizacion,
      });
    }

    if (filters?.estado) {
      queryBuilder.andWhere('proyecto.estado = :estado', {
        estado: filters.estado,
      });
    }

    if (filters?.nivelColaborativo !== undefined) {
      queryBuilder.andWhere('proyecto.nivelColaborativo = :nivelColaborativo', {
        nivelColaborativo: filters.nivelColaborativo,
      });
    }

    if (filters?.nivelOrganizativo !== undefined) {
      queryBuilder.andWhere('proyecto.nivelOrganizativo = :nivelOrganizativo', {
        nivelOrganizativo: filters.nivelOrganizativo,
      });
    }

    if (filters?.nivelVelocidadDesarrollo !== undefined) {
      queryBuilder.andWhere(
        'proyecto.nivelVelocidadDesarrollo = :nivelVelocidadDesarrollo',
        {
          nivelVelocidadDesarrollo: filters.nivelVelocidadDesarrollo,
        },
      );
    }

    if (filters?.nombreTecnologia) {
      queryBuilder.andWhere('tecnologia.nombre ILIKE :nombreTecnologia', {
        nombreTecnologia: `%${filters.nombreTecnologia}%`,
      });
    }

    if (filters?.tipoTecnologia) {
      queryBuilder.andWhere('tecnologia.tipo = :tipoTecnologia', {
        tipoTecnologia: filters.tipoTecnologia,
      });
    }

    const proyectos = await queryBuilder.distinct(true).getMany();

    if (hasTecnologiaFilters) {
      await Promise.all(
        proyectos.map(async (proyecto) => {
          const proyectoCompleto = await this.proyectoRepository
            .createQueryBuilder('proyecto')
            .leftJoinAndSelect('proyecto.nivelesProyecto', 'nivelesProyecto')
            .leftJoinAndSelect('nivelesProyecto.tecnologia', 'tecnologia')
            .where('proyecto.idProyecto = :idProyecto', {
              idProyecto: proyecto.idProyecto,
            })
            .getOne();

          if (proyectoCompleto?.nivelesProyecto) {
            proyecto.nivelesProyecto = proyectoCompleto.nivelesProyecto;
            this.ordenarTecnologias(proyecto, filters);
          }
        }),
      );
    }

    return proyectos;
  }

  private ordenarTecnologias(proyecto: Proyecto, filters?: FindProyectoDto) {
    if (!proyecto.nivelesProyecto || !filters) {
      return;
    }

    const nombreTecnologiaLower = filters.nombreTecnologia?.toLowerCase();
    const tipoTecnologia = filters.tipoTecnologia;

    proyecto.nivelesProyecto.sort((a, b) => {
      const aNombre = a.tecnologia?.nombre?.toLowerCase() || '';
      const bNombre = b.tecnologia?.nombre?.toLowerCase() || '';
      const aTipo = a.tecnologia?.tipo || '';
      const bTipo = b.tecnologia?.tipo || '';

      let aScore = 0;
      let bScore = 0;

      if (nombreTecnologiaLower && aNombre.includes(nombreTecnologiaLower)) {
        aScore += 2;
      }
      if (nombreTecnologiaLower && bNombre.includes(nombreTecnologiaLower)) {
        bScore += 2;
      }

      if (tipoTecnologia && aTipo === tipoTecnologia) {
        aScore += 1;
      }
      if (tipoTecnologia && bTipo === tipoTecnologia) {
        bScore += 1;
      }

      return bScore - aScore;
    });
  }

  async findOne(id: number, user: JwtPayload) {
    const proyecto = await this.proyectoRepository.findOne({
      where: { idProyecto: id, idUsuario: user.sub },
      relations: ['nivelesProyecto', 'nivelesProyecto.tecnologia'],
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con id ${id} no encontrado`);
    }
    return proyecto;
  }

  async update(id: number, updateProyectoDto: UpdateProyectoDto, user: JwtPayload) {
    try {
      const result = await this.proyectoRepository.update(
        { idProyecto: id, idUsuario: user.sub },
        updateProyectoDto, // ensure DTO clean
      );

      if (result.affected === 0) {
        throw new NotFoundException(`Proyecto con id ${id} no encontrado`);
      }

      return { message: 'Proyecto actualizado correctamente' };
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new InternalServerErrorException('Error al actualizar el proyecto');
    }
  }

  async remove(id: number, user: JwtPayload) {
    try {
      const result = await this.proyectoRepository.delete({
        idProyecto: id,
        idUsuario: user.sub,
      });

      if (result.affected === 0) {
        throw new NotFoundException(`Proyecto con id ${id} no encontrado`);
      }

      return { message: 'Proyecto eliminado correctamente' };
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new InternalServerErrorException('Error al eliminar el proyecto');
    }
  }
}
