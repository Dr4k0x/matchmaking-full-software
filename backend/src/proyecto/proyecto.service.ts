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
import { Tecnologia } from '../tecnologia/entities/tecnologia.entity';
import { NivelProyecto } from '../nivel-proyecto/entities/nivel-proyecto.entity';

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
          // Validate technologies ownership if any
          if (createProyectoDto.nivelesProyecto && createProyectoDto.nivelesProyecto.length > 0) {
            const techIds = createProyectoDto.nivelesProyecto.map(n => n.idTecnologia);
            await this.validateTechnologiesOwnership(techIds, user.sub, manager);
          }

          const proyecto = manager.getRepository(Proyecto).create({
            nombre: createProyectoDto.nombre,
            descripcion: createProyectoDto.descripcion,
            fechaCreacion: createProyectoDto.fechaCreacion,
            fechaFinalizacion: createProyectoDto.fechaFinalizacion,
            estado: createProyectoDto.estado,
            nivelColaborativo: createProyectoDto.nivelColaborativo,
            nivelOrganizativo: createProyectoDto.nivelOrganizativo,
            nivelVelocidadDesarrollo: createProyectoDto.nivelVelocidadDesarrollo,
            idUsuario: user.sub,
          });

          const savedProyecto = await manager
            .getRepository(Proyecto)
            .save(proyecto);

          if (Array.isArray(createProyectoDto?.nivelesProyecto)) {
            await this.nivelProyectoService.createMany(
              { niveles: createProyectoDto.nivelesProyecto },
              savedProyecto.idProyecto,
              manager,
            );
          }

          return { 
            message: 'Proyecto creado correctamente',
            idProyecto: savedProyecto.idProyecto 
          };
        },
      );
    } catch (error) {
      if (error instanceof NotFoundException || error.name === 'UnauthorizedException') throw error;
      throw new InternalServerErrorException('Error al crear el proyecto: ' + error.message);
    }
  }

  // Helper to validate technologies belong to the user
  private async validateTechnologiesOwnership(techIds: number[], idUsuario: number, manager: EntityManager) {
    const count = await manager.getRepository(Tecnologia).count({
      where: techIds.map(id => ({ idTecnologia: id, idUsuario }))
    });

    if (count !== techIds.length) {
      throw new NotFoundException('Una o más tecnologías no son válidas para este usuario');
    }
  }

  async findAll(user: JwtPayload, filters?: FindProyectoDto) {
    const hasTecnologiaFilters =
      filters?.nombreTecnologia || filters?.tipoTecnologia;

    const queryBuilder = this.proyectoRepository
      .createQueryBuilder('proyecto')
      .leftJoinAndSelect('proyecto.nivelesProyecto', 'nivelesProyecto')
      .leftJoinAndSelect('nivelesProyecto.tecnologia', 'tecnologia')
      .where('proyecto.idUsuario = :idUsuario', { idUsuario: user.sub });

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

    const proyectos = await queryBuilder.getMany();

    if (hasTecnologiaFilters) {
        this.proyectosFiltrarTecnologias(proyectos, filters);
    }

    return proyectos;
  }

  private proyectosFiltrarTecnologias(proyectos: Proyecto[], filters: FindProyectoDto) {
    proyectos.forEach(proyecto => this.ordenarTecnologias(proyecto, filters));
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
      
      let aScore = 0;
      let bScore = 0;

      if (nombreTecnologiaLower && aNombre.includes(nombreTecnologiaLower)) aScore += 2;
      if (nombreTecnologiaLower && bNombre.includes(nombreTecnologiaLower)) bScore += 2;

      if (tipoTecnologia && a.tecnologia?.tipo === tipoTecnologia) aScore += 1;
      if (tipoTecnologia && b.tecnologia?.tipo === tipoTecnologia) bScore += 1;

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
      return await this.transactionService.runInTransaction(async (manager: EntityManager) => {
        // 1. Confirm ownership and existence
        const proyecto = await manager.getRepository(Proyecto).findOne({
          where: { idProyecto: id, idUsuario: user.sub }
        });

        if (!proyecto) {
          throw new NotFoundException(`Proyecto con id ${id} no encontrado o no pertenece al usuario`);
        }

        // 2. Separate logic: Base fields vs Levels
        const { nivelesProyecto, ...fieldsToUpdate } = updateProyectoDto;
        
        // Update base fields
        if (fieldsToUpdate.nombre) proyecto.nombre = fieldsToUpdate.nombre;
        if (fieldsToUpdate.descripcion !== undefined) proyecto.descripcion = fieldsToUpdate.descripcion;
        if (fieldsToUpdate.fechaCreacion) proyecto.fechaCreacion = new Date(fieldsToUpdate.fechaCreacion);
        if (fieldsToUpdate.fechaFinalizacion) proyecto.fechaFinalizacion = new Date(fieldsToUpdate.fechaFinalizacion);
        if (fieldsToUpdate.estado) proyecto.estado = fieldsToUpdate.estado as any;
        if (fieldsToUpdate.nivelColaborativo !== undefined) proyecto.nivelColaborativo = fieldsToUpdate.nivelColaborativo;
        if (fieldsToUpdate.nivelOrganizativo !== undefined) proyecto.nivelOrganizativo = fieldsToUpdate.nivelOrganizativo;
        if (fieldsToUpdate.nivelVelocidadDesarrollo !== undefined) proyecto.nivelVelocidadDesarrollo = fieldsToUpdate.nivelVelocidadDesarrollo;

        await manager.getRepository(Proyecto).save(proyecto);

        // 3. Clear & Create for Technology Levels (Sync)
        if (nivelesProyecto !== undefined) {
          // Validate technology ownership if there are IDs to sync
          if (nivelesProyecto && nivelesProyecto.length > 0) {
            const techIds = nivelesProyecto.map(n => n.idTecnologia);
            await this.validateTechnologiesOwnership(techIds, user.sub, manager);
          }

          // Clear existing relations
          await manager.getRepository(NivelProyecto).delete({ idProyecto: id });

          // Re-insert if provided (non-empty)
          if (nivelesProyecto && nivelesProyecto.length > 0) {
            const nivelesParaInsertar = nivelesProyecto.map(n => ({
              idProyecto: id,
              idTecnologia: n.idTecnologia,
              nivelRequerido: n.nivelRequerido
            }));
            
            await manager.getRepository(NivelProyecto).insert(nivelesParaInsertar);
          }
        }

        // 4. Return complete object with fresh relations
        return await manager.getRepository(Proyecto).findOne({
          where: { idProyecto: id },
          relations: ['nivelesProyecto', 'nivelesProyecto.tecnologia']
        });
      });
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new InternalServerErrorException('Error al actualizar el proyecto: ' + e.message);
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
