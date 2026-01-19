import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindNivelCartaDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idCarta?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  nivelDominado?: number;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  tipo?: string;
}
