import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OmitType } from '@nestjs/mapped-types';
import { CreateNivelCartaDto } from './create-nivel-carta.dto';

export class CreateManyNivelCartaDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OmitType(CreateNivelCartaDto, ['idCarta']))
  niveles: Omit<CreateNivelCartaDto, 'idCarta'>[];
}
