import { Test, TestingModule } from '@nestjs/testing';
import { NivelProyectoService } from './nivel-proyecto.service';

describe('NivelProyectoService', () => {
  let service: NivelProyectoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NivelProyectoService],
    }).compile();

    service = module.get<NivelProyectoService>(NivelProyectoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
