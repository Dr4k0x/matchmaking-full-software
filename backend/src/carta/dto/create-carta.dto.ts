import { IsInt, IsString, Min, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OmitType } from '@nestjs/mapped-types';
import { CreateNivelCartaDto } from '../../nivel-carta/dto/create-nivel-carta.dto';

export class CreateCartaDto {
  @IsString()
  nombreApellido: string;

  @IsString()
  cedulaIdentidad: string;

  @IsString()
  tipoCarta: string;

  @IsInt()
  @Min(0)
  poderSocial: number;

  @IsInt()
  @Min(0)
  sabiduria: number;

  @IsInt()
  @Min(0)
  velocidad: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OmitType(CreateNivelCartaDto, ['idCarta']))
  nivelesCarta?: Omit<CreateNivelCartaDto, 'idCarta'>[];
}
