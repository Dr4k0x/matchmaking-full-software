import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Matchmaking } from './entities/matchmaking.entity';
import { CreateMatchmakingDto } from './dto/create-matchmaking.dto';
import { calcMatchmakingPercentage } from './utils/calc-matchmaking';
import { Proyecto } from '../proyecto/entities/proyecto.entity';
import { Carta } from '../carta/entities/carta.entity';
import { NivelProyecto } from '../nivel-proyecto/entities/nivel-proyecto.entity';
import { NivelCarta } from '../nivel-carta/entities/nivel-carta.entity';
import { MatchmakingRandomDto } from './dto/matchmaking-random.dto';
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
  ) {}

  async create(dto: CreateMatchmakingDto, user: JwtPayload) {
    const { idProyecto, cartasIds } = dto;

    // 1) Validate project and ownership
    const proyecto = await this.proyectoRepo.findOne({
      where: { idProyecto, idUsuario: user.sub } as any, // Filter by user
    });
    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado o no pertenece al usuario');
    }

    // 2) Validate cards and ownership
    const cartas = await this.cartaRepo.find({
      where: {
        idCarta: In(cartasIds),
        usuario: { idUsuario: user.sub } as any // Filter by user
      },
    });
    if (!cartas.length || cartas.length !== cartasIds.length) {
      throw new BadRequestException('Algunas cartas no fueron encontradas o no pertenecen al usuario');
    }

    // 3) Load requirements
    const nivelesProyecto = await this.nivelProyectoRepo.find({
      where: { proyecto: { idProyecto } } as any,
      relations: { tecnologia: true } as any,
    });

    if (!nivelesProyecto.length) {
      throw new BadRequestException(
        'El proyecto no tiene tecnologías/niveles requeridos configurados',
      );
    }

    // 4) Load skills
    const nivelesCarta = await this.nivelCartaRepo.find({
      where: { carta: { idCarta: In(cartasIds) } } as any,
      relations: { tecnologia: true } as any,
    });

    // 5) Map
    const requirements = this.mapRequirements(proyecto, nivelesProyecto);
    const skills = this.mapSkills(cartas, nivelesCarta);

    // 6) Calculate
    const porcentaje = calcMatchmakingPercentage(requirements, skills, {
      applyMissingPenalty: true,
      missingThreshold: 0.6,
      missingPenaltyMax: 0.25,
    });

    // 7) Save
    try {
      const existente = await this.matchmakingRepo.findOne({
        where: { idProyecto } as any,
      });

      if (existente) {
        existente.resultadoPorcentaje = porcentaje;
        await this.matchmakingRepo.save(existente);
        return {
          message: 'Matchmaking recalculado con éxito',
          resultadoPorcentaje: porcentaje,
          idMatchmaking: existente.idMatchmaking,
        };
      }

      const nuevo = this.matchmakingRepo.create({
        idProyecto,
        resultadoPorcentaje: porcentaje,
        proyecto,
        cartas,
      } as Matchmaking);

      await this.matchmakingRepo.save(nuevo);

      return {
        message: 'Matchmaking creado con éxito',
        resultadoPorcentaje: porcentaje,
      };
    } catch (e) {
      throw new InternalServerErrorException('Error al guardar el matchmaking');
    }
  }

  async findRandomTeamAgainstProject(dto: MatchmakingRandomDto, user: JwtPayload) {
    const { idProyecto, maxCards = 5, attempts = 200, threshold = 70, seed } = dto;

    // 1) Load project with user check
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
      throw new BadRequestException(
        'El proyecto no tiene tecnologías/niveles requeridos configurados',
      );
    }

    const requirements = this.mapRequirements(proyecto, nivelesProyecto);

    // 3) Load candidate cards (User's cards only)
    const allCards = await this.cartaRepo.find({
      where: { usuario: { idUsuario: user.sub } as any }
    });
    if (allCards.length === 0) {
      throw new BadRequestException('No hay cartas disponibles en el sistema');
    }

    // 4) Load levels for pool
    const cardIds = allCards.map((c) => c.idCarta);
    const allNivelesCarta = await this.nivelCartaRepo.find({
      where: { idCarta: In(cardIds) },
      relations: { tecnologia: true },
    });

    const cardSkillsMap = new Map<number, NivelCarta[]>();
    for (const nc of allNivelesCarta) {
      const cid = nc.idCarta;
      const skills = cardSkillsMap.get(cid) ?? [];
      skills.push(nc);
      cardSkillsMap.set(cid, skills);
    }

    // 5) Simulation
    let bestCombination: Carta[] = [];
    let bestPercentage = -1;
    let bestSkills: any[] = [];

    const seededRandom = this.getSeededRandom(seed);

    for (let i = 0; i < attempts; i++) {
      const numCards = Math.floor(seededRandom() * maxCards) + 1;
      const shuffled = [...allCards].sort(() => 0.5 - seededRandom());
      const selectedCards = shuffled.slice(0, numCards);

      const combinedSkills = this.mapSkills(
        selectedCards,
        selectedCards.flatMap((c) => cardSkillsMap.get(c.idCarta) || []),
      );

      const percentage = calcMatchmakingPercentage(requirements, combinedSkills, {
        applyMissingPenalty: true,
        missingThreshold: 0.6,
        missingPenaltyMax: 0.25,
      });

      if (percentage > bestPercentage) {
        bestPercentage = percentage;
        bestCombination = selectedCards;
        bestSkills = combinedSkills;

        if (bestPercentage >= threshold) {
          break;
        }
      }
    }

    // 6) Returns
    return {
      proyectoId: idProyecto,
      resultadoPorcentaje: bestPercentage,
      cartas: bestCombination,
      metadata: {
        attemptsUsed: attempts,
        thresholdReached: bestPercentage >= threshold,
        totalCandidates: allCards.length,
        combinedSkills: bestSkills,
      },
    };
  }

  // ... maps helpers ... (omitted from replacement if not changing, but I am replacing whole methods block so I must include helpers or select range specifically)
  // Warning: I need to be careful not to delete helpers if I select a range.
  // The replace_file_content replaces the TARGET CONTENT chunk.
  // I will target the specific methods `create`, `findRandom...`, `findAll`, `findOne`, `remove`.

  private mapRequirements(proyecto: Proyecto, nivelesProyecto: NivelProyecto[]) {
    const requirements = nivelesProyecto.map((np) => ({
      techId: np.tecnologia.idTecnologia,
      requiredLevel: Number(np.nivelRequerido ?? (np as any).nivel_requerido),
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
      dominanceLevel: Number(nc.nivelDominado ?? (nc as any).nivel_dominado),
    }));
    for (const carta of cartas) {
      skills.push({ techId: -1, dominanceLevel: carta.poderSocial });
      skills.push({ techId: -2, dominanceLevel: carta.sabiduria });
      skills.push({ techId: -3, dominanceLevel: carta.velocidad });
    }
    return skills;
  }

  private getSeededRandom(seed?: string) {
    if (!seed) return Math.random;
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
        h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
    }
    return function() {
        h = Math.imul(31, h) + 0xDEADBEEF | 0;
        const x = Math.sin(h) * 10000;
        return x - Math.floor(x);
    };
  }


  async findAll(user: JwtPayload) {
    // List matchmakings via Project relation owned by user
    return this.matchmakingRepo.find({
        where: { proyecto: { idUsuario: user.sub } } as any,
        relations: ['proyecto']
    });
  }

  async findOne(id: number, user: JwtPayload) {
    const mm = await this.matchmakingRepo.findOne({
      where: { 
          idMatchmaking: id,
          proyecto: { idUsuario: user.sub } // Scoped by project owner
      } as any,
      relations: ['proyecto', 'cartas']
    });
    if (!mm) throw new NotFoundException('Matchmaking no encontrado');
    return mm;
  }

  async remove(id: number, user: JwtPayload) {
    // Verify ownership via FindOne
    const mm = await this.findOne(id, user);

    // 1) Unassign cards
    await this.cartaRepo.update(
      { matchmaking: { idMatchmaking: id } } as any,
      { matchmaking: null } as any,
    );

    // 2) Delete
    const result = await this.matchmakingRepo.delete({
      idMatchmaking: id,
    } as any);

    if (!result.affected) {
      throw new NotFoundException('Matchmaking no encontrado');
    }

    return { message: 'Matchmaking eliminado con éxito' };
  }
}
