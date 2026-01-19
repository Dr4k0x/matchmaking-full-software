import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { NivelCarta } from './entities/nivel-carta.entity';
import { CreateNivelCartaDto } from './dto/create-nivel-carta.dto';
import { UpdateNivelCartaDto } from './dto/update-nivel-carta.dto';
import { CreateManyNivelCartaDto } from './dto/create-many-nivel-carta.dto';
import { FindNivelCartaDto } from './dto/find-nivel-carta.dto';

@Injectable()
export class NivelCartaService {
  constructor(
    @InjectRepository(NivelCarta)
    private readonly nivelCartaRepository: Repository<NivelCarta>,
  ) {}

  async create(createNivelCartaDto: CreateNivelCartaDto) {
    try {
      const nivelCarta = this.nivelCartaRepository.create({
        ...createNivelCartaDto,
      });
      await this.nivelCartaRepository.save(nivelCarta);
      return { message: 'Nivel de carta creado correctamente' };
    } catch {
      throw new InternalServerErrorException(
        'Error al crear el nivel de carta',
      );
    }
  }

  async createMany(
    CreateManyNivelCartaDto: CreateManyNivelCartaDto,
    idCarta: number,
    manager?: EntityManager,
  ) {
    try {
      const nivelesToInsert = CreateManyNivelCartaDto.niveles.map((nivel) => ({
        idCarta: idCarta,
        idTecnologia: nivel.idTecnologia,
        nivelDominado: nivel.nivelDominado,
      }));
      
      const repository = manager
        ? manager.getRepository(NivelCarta)
        : this.nivelCartaRepository;

      await repository.insert(nivelesToInsert);

      return {
        message: `${nivelesToInsert.length} niveles de carta creados correctamente para la carta ${idCarta}`,
        count: nivelesToInsert.length,
      };
    } catch {
      throw new InternalServerErrorException(
        'Error al crear múltiples niveles de carta',
      );
    }
  }

  async findAll(query: FindNivelCartaDto) {
    const { idCarta, nivelDominado, nombre, tipo } = query;

    const queryBuilder = this.nivelCartaRepository
      .createQueryBuilder('nivelCarta')
      .leftJoinAndSelect('nivelCarta.carta', 'carta')
      .leftJoinAndSelect('nivelCarta.tecnologia', 'tecnologia');

    if (idCarta) {
      queryBuilder.andWhere('nivelCarta.idCarta = :idCarta', {
        idCarta,
      });
    }

    if (nivelDominado) {
      queryBuilder.andWhere('nivelCarta.nivelDominado = :nivelDominado', {
        nivelDominado,
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

    return await queryBuilder.getMany();
  }

  async findOne(id: number) {
    const nivelCarta = await this.nivelCartaRepository.findOne({
      where: { idNivelCarta: id },
      relations: ['tecnologia'],
    });

    if (!nivelCarta) {
      throw new NotFoundException(`Nivel de carta con id ${id} no encontrado`);
    }

    return nivelCarta;
  }

  async update(id: number, updateNivelCartaDto: UpdateNivelCartaDto) {
    try {
      await this.nivelCartaRepository.update(id, updateNivelCartaDto);
      return { message: 'Nivel de carta actualizado correctamente' };
    } catch {
      throw new InternalServerErrorException(
        'Error al actualizar el nivel de carta',
      );
    }
  }

  async remove(id: number) {
    try {
      await this.nivelCartaRepository.delete(id);
      return { message: 'Nivel de carta eliminado correctamente' };
    } catch {
      throw new InternalServerErrorException(
        'Error al eliminar el nivel de carta',
      );
    }
  }

  async removeAllByCarta(idCarta: number) {
    try {
      await this.nivelCartaRepository.delete({ carta: { idCarta } });
      return { message: `Niveles eliminados para la carta ${idCarta}` };
    } catch (e) {
      console.error(e); // Helper log
      throw new InternalServerErrorException(
        'Error al limpiar niveles anteriores de la carta',
      );
    }
  }
}
