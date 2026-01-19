import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUsuarioDto } from '../usuarios/dto/login-usuario.dto';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { UsuariosService } from '../usuarios/usuarios.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usuariosService: UsuariosService,
  ) {}

  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() loginDto: LoginUsuarioDto) {
    return this.usuariosService.login(loginDto);
  }

  @Post('register')
  @UsePipes(new ValidationPipe())
  async register(@Body() createDto: CreateUsuarioDto) {
    return this.usuariosService.create(createDto);
  }
}
