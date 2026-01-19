import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { OmitType } from '@nestjs/mapped-types';
import { CreateNivelProyectoDto } from './create-nivel-proyecto.dto';

export class CreateManyNivelProyectoDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OmitType(CreateNivelProyectoDto, ['idProyecto']))
  niveles: Omit<CreateNivelProyectoDto, 'idProyecto'>[];
}
