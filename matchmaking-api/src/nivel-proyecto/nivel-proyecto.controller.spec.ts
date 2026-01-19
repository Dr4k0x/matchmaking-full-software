import { Test, TestingModule } from '@nestjs/testing';
import { NivelProyectoController } from './nivel-proyecto.controller';
import { NivelProyectoService } from './nivel-proyecto.service';

describe('NivelProyectoController', () => {
  let controller: NivelProyectoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NivelProyectoController],
      providers: [NivelProyectoService],
    }).compile();

    controller = module.get<NivelProyectoController>(NivelProyectoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
