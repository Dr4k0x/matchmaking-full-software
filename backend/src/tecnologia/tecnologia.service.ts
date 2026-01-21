import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTecnologiaDto } from './dto/create-tecnologia.dto';
import { UpdateTecnologiaDto } from './dto/update-tecnologia.dto';
import { FindTecnologiaDto } from './dto/find-tecnologia.dto';
import { Tecnologia } from './entities/tecnologia.entity';
import { NivelCarta } from '../nivel-carta/entities/nivel-carta.entity';
import { NivelProyecto } from '../nivel-proyecto/entities/nivel-proyecto.entity';

import { JwtPayload } from 'src/auth/jwt-payload.interface';

@Injectable()
export class TecnologiaService {
  constructor(
    @InjectRepository(Tecnologia)
    private readonly tecnologiaRepository: Repository<Tecnologia>,
    @InjectRepository(NivelCarta)
    private readonly nivelCartaRepository: Repository<NivelCarta>,
    @InjectRepository(NivelProyecto)
    private readonly nivelProyectoRepository: Repository<NivelProyecto>,
  ) {}


  async create(createTecnologiaDto: CreateTecnologiaDto, user: JwtPayload) {
    try {
      const tecnologia = this.tecnologiaRepository.create({
        idUsuario: user.sub,
        ...createTecnologiaDto,
      });

      await this.tecnologiaRepository.save(tecnologia);
      return { message: 'Tecnologia creada correctamente' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al crear la tecnologia\n' + (error as Error).message,
      );
    }
  }

  async findAll(query: FindTecnologiaDto, user: JwtPayload) {
    const { nombre, tipo, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder =
      this.tecnologiaRepository.createQueryBuilder('tecnologia')
      .where('tecnologia.idUsuario = :idUsuario', { idUsuario: user.sub });

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

    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, user: JwtPayload) {
    const tecnologia = await this.tecnologiaRepository.findOne({
      where: { idTecnologia: id, idUsuario: user.sub },
    });
    if (!tecnologia) {
      throw new NotFoundException(`Tecnologia con id ${id} no encontrada`);
    }
    return tecnologia;
  }

  async update(
    id: number,
    updateTecnologiaDto: UpdateTecnologiaDto,
    user: JwtPayload,
  ) {
    const tecnologia = await this.findOne(id, user);
    // User check already implicit in findOne, but keeping logic
    if (tecnologia.idUsuario !== user.sub) {
      throw new UnauthorizedException('Usuario no autorizado');
    }
    Object.assign(tecnologia, {
      idUsuario: user.sub,
      ...updateTecnologiaDto,
    });
    try {
      await this.tecnologiaRepository.save(tecnologia);
      return { message: 'Tecnologia actualizada correctamente' };
    } catch {
      throw new InternalServerErrorException(
        'Error al actualizar la tecnologia',
      );
    }
  }

  async remove(id: number, user: JwtPayload) {
    const tecnologia = await this.findOne(id, user);

    // Check associations
    const [countCarta, countProyecto] = await Promise.all([
      this.nivelCartaRepository.count({ where: { idTecnologia: id } }),
      this.nivelProyectoRepository.count({ where: { idTecnologia: id } }),
    ]);

    if (countCarta > 0 || countProyecto > 0) {
      let message = 'No se puede eliminar: esta tecnología está asociada a ';
      if (countCarta > 0 && countProyecto > 0) {
        message += 'empleados y proyectos.';
      } else if (countCarta > 0) {
        message += 'al menos un empleado.';
      } else {
        message += 'al menos un proyecto.';
      }
      throw new ConflictException(message);
    }


    await this.tecnologiaRepository.remove(tecnologia);
    return { message: `Tecnologia con id ${id} eliminada correctamente` };
  }
}
