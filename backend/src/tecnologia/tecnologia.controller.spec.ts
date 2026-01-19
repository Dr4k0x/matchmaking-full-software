import { Test, TestingModule } from '@nestjs/testing';
import { TecnologiaController } from './tecnologia.controller';
import { TecnologiaService } from './tecnologia.service';

describe('TecnologiaController', () => {
  let controller: TecnologiaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TecnologiaController],
      providers: [TecnologiaService],
    }).compile();

    controller = module.get<TecnologiaController>(TecnologiaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
