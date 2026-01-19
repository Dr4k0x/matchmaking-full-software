import { Test, TestingModule } from '@nestjs/testing';
import { NivelCartaService } from './nivel-carta.service';

describe('NivelCartaService', () => {
  let service: NivelCartaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NivelCartaService],
    }).compile();

    service = module.get<NivelCartaService>(NivelCartaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
