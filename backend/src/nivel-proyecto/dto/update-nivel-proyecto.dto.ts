import { PartialType } from '@nestjs/mapped-types';
import { CreateNivelProyectoDto } from './create-nivel-proyecto.dto';

export class UpdateNivelProyectoDto extends PartialType(
  CreateNivelProyectoDto,
) {}
