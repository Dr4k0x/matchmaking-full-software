import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsInt, Min } from 'class-validator';

export class CreateMatchmakingDto {
  @IsInt()
  @Min(1)
  idProyecto: number;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(5)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  cartasIds: number[];
}
