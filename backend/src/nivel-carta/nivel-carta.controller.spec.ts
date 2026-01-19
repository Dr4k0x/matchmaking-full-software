import { Test, TestingModule } from '@nestjs/testing';
import { NivelCartaController } from './nivel-carta.controller';
import { NivelCartaService } from './nivel-carta.service';

describe('NivelCartaController', () => {
  let controller: NivelCartaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NivelCartaController],
      providers: [NivelCartaService],
    }).compile();

    controller = module.get<NivelCartaController>(NivelCartaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
