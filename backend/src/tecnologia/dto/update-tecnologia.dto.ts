import { PartialType } from '@nestjs/mapped-types';
import { CreateTecnologiaDto } from './create-tecnologia.dto';

export class UpdateTecnologiaDto extends PartialType(CreateTecnologiaDto) {}
