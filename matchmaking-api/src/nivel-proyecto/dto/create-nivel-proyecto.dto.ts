import { IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class CreateNivelProyectoDto {
  @IsNumber()
  @IsNotEmpty()
  idProyecto: number;

  @IsNumber()
  @IsNotEmpty()
  idTecnologia: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(10)
  nivelRequerido: number;
}
