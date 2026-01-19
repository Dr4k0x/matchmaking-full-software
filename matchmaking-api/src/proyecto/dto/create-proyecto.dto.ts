import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsEnum,
  IsISO8601,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { CreateManyNivelProyectoDto } from 'src/nivel-proyecto/dto/create-many-nivel-proyecto.dto';
import { CreateNivelProyectoDto } from 'src/nivel-proyecto/dto/create-nivel-proyecto.dto';
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';

export enum EstadoProyecto {
  EN_PROCESO = 'P',
  FINALIZADO = 'F',
  EN_ESPERA = 'E',
}

export class CreateProyectoDto extends PartialType(CreateManyNivelProyectoDto) {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsISO8601()
  @IsNotEmpty()
  fechaCreacion: string;

  @IsISO8601()
  @IsNotEmpty()
  fechaFinalizacion: string;

  @IsString()
  @IsEnum(EstadoProyecto)
  estado: EstadoProyecto;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(10)
  nivelColaborativo: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(10)
  nivelOrganizativo: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(10)
  nivelVelocidadDesarrollo: number;


  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OmitType(CreateNivelProyectoDto, ['idProyecto']))
  nivelesProyecto?: Omit<CreateNivelProyectoDto, 'idProyecto'>[];
}
