import {
  IsOptional,
  IsString,
  IsInt,
  IsEnum,
  IsISO8601,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoProyecto } from './create-proyecto.dto';

export class FindProyectoDto {
  @IsOptional()
  @IsString()
  nombreProyecto?: string;

  @IsOptional()
  @IsISO8601()
  fechaCreacion?: string;

  @IsOptional()
  @IsISO8601()
  fechaFinalizacion?: string;

  @IsOptional()
  @IsEnum(EstadoProyecto)
  estado?: EstadoProyecto;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  nivelColaborativo?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  nivelOrganizativo?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  nivelVelocidadDesarrollo?: number;

  @IsOptional()
  @IsString()
  nombreTecnologia?: string;

  @IsOptional()
  @IsString()
  tipoTecnologia?: string;
}
