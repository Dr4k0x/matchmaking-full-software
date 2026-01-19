import { Test, TestingModule } from '@nestjs/testing';
import { CartaController } from './carta.controller';
import { CartaService } from './carta.service';

describe('CartaController', () => {
  let controller: CartaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartaController],
      providers: [CartaService],
    }).compile();

    controller = module.get<CartaController>(CartaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
