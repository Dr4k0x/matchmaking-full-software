import { IsNotEmpty, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreateNivelCartaDto {
  @IsNumber()
  @IsNotEmpty()
  idCarta: number;

  @IsNumber()
  @IsNotEmpty()
  idTecnologia: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  nivelDominado: number;
}
