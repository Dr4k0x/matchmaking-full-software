import { Test, TestingModule } from '@nestjs/testing';
import { CartaService } from './carta.service';

describe('CartaService', () => {
  let service: CartaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CartaService],
    }).compile();

    service = module.get<CartaService>(CartaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
