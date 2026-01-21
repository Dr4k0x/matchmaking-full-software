import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, DataSource } from 'typeorm';

import { Matchmaking } from './entities/matchmaking.entity';
import { CreateMatchmakingDto } from './dto/create-matchmaking.dto';
import { calcMatchmakingPercentage } from './utils/calc-matchmaking';
import { Proyecto } from '../proyecto/entities/proyecto.entity';
import { Carta } from '../carta/entities/carta.entity';
import { NivelProyecto } from '../nivel-proyecto/entities/nivel-proyecto.entity';
import { NivelCarta } from '../nivel-carta/entities/nivel-carta.entity';
import { JwtPayload } from 'src/auth/jwt-payload.interface';

@Injectable()
export class MatchmakingService {
  constructor(
    @InjectRepository(Matchmaking)
    private readonly matchmakingRepo: Repository<Matchmaking>,

    @InjectRepository(Proyecto)
    private readonly proyectoRepo: Repository<Proyecto>,

    @InjectRepository(Carta)
    private readonly cartaRepo: Repository<Carta>,

    @InjectRepository(NivelProyecto)
    private readonly nivelProyectoRepo: Repository<NivelProyecto>,

    @InjectRepository(NivelCarta)
    private readonly nivelCartaRepo: Repository<NivelCarta>,

    private dataSource: DataSource,
  ) {}

  async preview(dto: CreateMatchmakingDto, user: JwtPayload) {
    const { idProyecto, cartasIds } = dto;

    // 1) Load project and ownership
    const proyecto = await this.proyectoRepo.findOne({
      where: { idProyecto, idUsuario: user.sub } as any,
    });
    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // 2) Load requirements
    const nivelesProyecto = await this.nivelProyectoRepo.find({
      where: { proyecto: { idProyecto } } as any,
      relations: { tecnologia: true } as any,
    });

    if (!nivelesProyecto.length) {
      throw new BadRequestException('El proyecto no tiene tecnologías requeridas configuradas');
    }

    // 3) Load cards and ownership
    const cartas = await this.cartaRepo.find({
      where: {
        idCarta: In(cartasIds),
        usuario: { idUsuario: user.sub } as any
      },
    });
    if (cartas.length !== cartasIds.length) {
      throw new BadRequestException('Algunas cartas no pertenecen al usuario o no existen');
    }

    // 4) Load skills
    const nivelesCarta = await this.nivelCartaRepo.find({
      where: { carta: { idCarta: In(cartasIds) } } as any,
      relations: { tecnologia: true } as any,
    });

    // 5) Map
    const requirements = this.mapRequirements(proyecto, nivelesProyecto);
    const skills = this.mapSkills(cartas, nivelesCarta);

    const porcentaje = calcMatchmakingPercentage(requirements, skills, {
      applyMissingPenalty: true,
      missingThreshold: 0.6,
      missingPenaltyMax: 0.25,
    });

    return { porcentaje: Math.round(porcentaje * 100) / 100 };
  }

  async create(dto: CreateMatchmakingDto, user: JwtPayload) {
    const { idProyecto, cartasIds } = dto;

    return await this.dataSource.transaction(async (manager) => {
      // 1) Business Rule: 1:1 Project
      const existente = await manager.findOne(Matchmaking, {
        where: { idProyecto } as any,
      });
      if (existente) {
        throw new ConflictException('Este proyecto ya está asociado a un matchmaking activo.');
      }

      // 2) Business Rule: Cards availability
      const anyOccupied = await manager.createQueryBuilder(Carta, 'carta')
        .where('carta.idCarta IN (:...ids)', { ids: cartasIds })
        .andWhere('carta.id_matchmaking IS NOT NULL')
        .getOne();

      if (anyOccupied) {
        throw new ConflictException(`La carta de ${anyOccupied.nombreApellido} ya está asignada a otro matchmaking.`);
      }

      // 3) Calculate Percentage (reusing preview logic)
      const { porcentaje } = await this.preview(dto, user);

      // 4) Business Rule: Score > 70
      if (porcentaje <= 70) {
        throw new BadRequestException(`La compatibilidad es insuficiente (${porcentaje}%). Debe ser superior al 70% para crear el matchmaking.`);
      }

      // 5) Save Matchmaking
      const proyecto = await manager.findOne(Proyecto, { where: { idProyecto } } as any);
      if (!proyecto) throw new NotFoundException('Proyecto no encontrado');

      const cartas = await manager.find(Carta, { where: { idCarta: In(cartasIds) } } as any);

      const nuevo = manager.create(Matchmaking, {
        idProyecto,
        resultadoPorcentaje: porcentaje,
        proyecto,
        cartas,
      } as any);

      const saved = await manager.save(nuevo);

      // 6) Update cards
      await manager.update(Carta, { idCarta: In(cartasIds) }, { matchmaking: saved } as any);

      return {
        message: 'Matchmaking creado con éxito',
        idMatchmaking: saved.idMatchmaking,
        resultadoPorcentaje: saved.resultadoPorcentaje,
        proyecto: proyecto.nombre
      };
    }).catch(e => {
      console.error('Matchmaking creation error:', e);
      throw e;
    });
  }

  private mapRequirements(proyecto: Proyecto, nivelesProyecto: NivelProyecto[]) {
    const requirements = nivelesProyecto.map((np) => ({
      techId: np.tecnologia.idTecnologia,
      requiredLevel: Number(np.nivelRequerido),
    }));
    requirements.push({ techId: -1, requiredLevel: proyecto.nivelColaborativo });
    requirements.push({ techId: -2, requiredLevel: proyecto.nivelOrganizativo });
    requirements.push({
      techId: -3,
      requiredLevel: proyecto.nivelVelocidadDesarrollo,
    });
    return requirements;
  }

  private mapSkills(cartas: Carta[], nivelesCarta: NivelCarta[]) {
    const skills = nivelesCarta.map((nc) => ({
      techId: nc.tecnologia.idTecnologia,
      dominanceLevel: Number(nc.nivelDominado),
    }));
    for (const carta of cartas) {
      skills.push({ techId: -1, dominanceLevel: carta.poderSocial });
      skills.push({ techId: -2, dominanceLevel: carta.sabiduria });
      skills.push({ techId: -3, dominanceLevel: carta.velocidad });
    }
    return skills;
  }

  async findAll(user: JwtPayload) {
    return this.matchmakingRepo.find({
      where: { proyecto: { idUsuario: user.sub } } as any,
      relations: ['proyecto'],
      order: { idMatchmaking: 'DESC' }
    });
  }

  async findOne(id: number, user: JwtPayload) {
    const mm = await this.matchmakingRepo.findOne({
      where: { 
        idMatchmaking: id,
        proyecto: { idUsuario: user.sub }
      } as any,
      relations: {
        proyecto: {
          nivelesProyecto: {
            tecnologia: true
          }
        },
        cartas: {
          nivelesCarta: {
            tecnologia: true
          }
        }
      } as any
    });
    if (!mm) throw new NotFoundException('Matchmaking no encontrado');
    return mm;
  }

  async remove(id: number, user: JwtPayload) {
    const mm = await this.findOne(id, user);

    return await this.dataSource.transaction(async (manager) => {
      // 1) Unassign cards
      await manager.update(
        Carta, 
        { matchmaking: { idMatchmaking: id } } as any, 
        { matchmaking: null } as any
      );

      // 2) Delete
      await manager.delete(Matchmaking, { idMatchmaking: id });

      return { message: 'Matchmaking eliminado con éxito' };
    });
  }
}
