import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateEstadoProyectoDto {
  @IsNotEmpty({ message: 'El estado es obligatorio.' })
  @IsEnum(['E', 'P', 'F'], { message: 'El estado debe ser E (En Espera), P (En Proceso) o F (Finalizado).' })
  estado: string;
}
