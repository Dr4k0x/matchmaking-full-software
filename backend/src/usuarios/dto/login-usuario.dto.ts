import { OmitType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto';

export class LoginUsuarioDto extends OmitType(CreateUsuarioDto, ['nombre']) {}
