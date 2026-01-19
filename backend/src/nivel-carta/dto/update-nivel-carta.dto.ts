import { PartialType } from '@nestjs/mapped-types';
import { CreateNivelCartaDto } from './create-nivel-carta.dto';

export class UpdateNivelCartaDto extends PartialType(CreateNivelCartaDto) {}
