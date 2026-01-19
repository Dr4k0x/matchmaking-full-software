import { IsString, IsNotEmpty } from 'class-validator';
export class CreateTecnologiaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  tipo: string;
}
