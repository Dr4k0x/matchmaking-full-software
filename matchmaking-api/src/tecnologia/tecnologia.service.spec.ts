import { Test, TestingModule } from '@nestjs/testing';
import { TecnologiaService } from './tecnologia.service';

describe('TecnologiaService', () => {
  let service: TecnologiaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TecnologiaService],
    }).compile();

    service = module.get<TecnologiaService>(TecnologiaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
