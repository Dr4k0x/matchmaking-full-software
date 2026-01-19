import { ArrayNotEmpty, IsArray, IsInt, Min } from 'class-validator';

export class CreateMatchmakingDto {
  @IsInt()
  @Min(1)
  idProyecto: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Min(1, { each: true })
  cartasIds: number[];
}
