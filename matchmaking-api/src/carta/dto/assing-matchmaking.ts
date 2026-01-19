import { IsInt, Min } from 'class-validator';

export class AsignarMatchmakingDto {
  @IsInt()
  @Min(1)
  matchmakingId: number;
}
