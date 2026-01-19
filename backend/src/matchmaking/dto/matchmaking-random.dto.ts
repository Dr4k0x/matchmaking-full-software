import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class MatchmakingRandomDto {
  @IsInt()
  idProyecto: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  maxCards?: number = 5;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  attempts?: number = 200;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  threshold?: number = 70;

  @IsOptional()
  @IsString()
  seed?: string;
}
