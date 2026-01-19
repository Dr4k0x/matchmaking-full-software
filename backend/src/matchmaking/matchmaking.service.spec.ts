import { Test, TestingModule } from '@nestjs/testing';
import { MatchmakingService } from './matchmaking.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Matchmaking } from './entities/matchmaking.entity';
import { Proyecto } from '../proyecto/entities/proyecto.entity';
import { Carta } from '../carta/entities/carta.entity';
import { NivelProyecto } from '../nivel-proyecto/entities/nivel-proyecto.entity';
import { NivelCarta } from '../nivel-carta/entities/nivel-carta.entity';
import { NotFoundException } from '@nestjs/common';

describe('MatchmakingService', () => {
  let service: MatchmakingService;
  let proyectoRepo: any;
  let cartaRepo: any;
  let nivelProyectoRepo: any;
  let nivelCartaRepo: any;

  const mockProyecto = {
    idProyecto: 1,
    nivelColaborativo: 5,
    nivelOrganizativo: 5,
    nivelVelocidadDesarrollo: 5,
  };

  const mockCartas = [
    { idCarta: 1, poder_social: 8, sabiduria: 8, velocidad: 8 },
    { idCarta: 2, poder_social: 2, sabiduria: 2, velocidad: 2 },
  ];

  const mockNivelesProyecto = [
    { idProyecto: 1, tecnologia: { idTecnologia: 1 }, nivelRequerido: 5 },
  ];

  const mockNivelesCarta = [
    { idCarta: 1, carta: { idCarta: 1 }, tecnologia: { idTecnologia: 1 }, nivelDominado: 10 },
    { idCarta: 2, carta: { idCarta: 2 }, tecnologia: { idTecnologia: 1 }, nivelDominado: 2 },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchmakingService,
        {
          provide: getRepositoryToken(Matchmaking),
          useValue: { findOne: jest.fn(), save: jest.fn(), create: jest.fn() },
        },
        {
          provide: getRepositoryToken(Proyecto),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(Carta),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(NivelProyecto),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(NivelCarta),
          useValue: { find: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<MatchmakingService>(MatchmakingService);
    proyectoRepo = module.get(getRepositoryToken(Proyecto));
    cartaRepo = module.get(getRepositoryToken(Carta));
    nivelProyectoRepo = module.get(getRepositoryToken(NivelProyecto));
    nivelCartaRepo = module.get(getRepositoryToken(NivelCarta));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findRandomTeamAgainstProject', () => {
    it('should throw NotFoundException if project not found', async () => {
      proyectoRepo.findOne.mockResolvedValue(null);
      await expect(
        service.findRandomTeamAgainstProject({ idProyecto: 999 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should find a good team if it exists', async () => {
      proyectoRepo.findOne.mockResolvedValue(mockProyecto);
      nivelProyectoRepo.find.mockResolvedValue(mockNivelesProyecto);
      cartaRepo.find.mockResolvedValue(mockCartas);
      nivelCartaRepo.find.mockResolvedValue(mockNivelesCarta);

      const result = await service.findRandomTeamAgainstProject({
        idProyecto: 1,
        threshold: 80,
        attempts: 100,
      });

      expect(result.resultadoPorcentaje).toBeGreaterThanOrEqual(80);
      expect(result.cartas.some((c) => c.idCarta === 1)).toBeTruthy();
    });

    it('should return best found even if threshold not reached', async () => {
      proyectoRepo.findOne.mockResolvedValue(mockProyecto);
      nivelProyectoRepo.find.mockResolvedValue([{ tecnologia: { idTecnologia: 1 }, nivelRequerido: 100 }]); // Impossible
      cartaRepo.find.mockResolvedValue(mockCartas);
      nivelCartaRepo.find.mockResolvedValue(mockNivelesCarta);

      const result = await service.findRandomTeamAgainstProject({
        idProyecto: 1,
        threshold: 100,
        attempts: 10,
      });

      expect(result.metadata.thresholdReached).toBeFalsy();
      expect(result.resultadoPorcentaje).toBeDefined();
    });

    it('should be deterministic with a seed', async () => {
      proyectoRepo.findOne.mockResolvedValue(mockProyecto);
      nivelProyectoRepo.find.mockResolvedValue(mockNivelesProyecto);
      cartaRepo.find.mockResolvedValue(mockCartas);
      nivelCartaRepo.find.mockResolvedValue(mockNivelesCarta);

      const result1 = await service.findRandomTeamAgainstProject({
        idProyecto: 1,
        seed: 'test-seed',
      });
      const result2 = await service.findRandomTeamAgainstProject({
        idProyecto: 1,
        seed: 'test-seed',
      });

      expect(result1.resultadoPorcentaje).toEqual(result2.resultadoPorcentaje);
      expect(result1.cartas).toEqual(result2.cartas);
    });
  });
});
