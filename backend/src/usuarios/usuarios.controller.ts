import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User as CurrentUser } from '../auth/decorators/user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller()
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post('login')
  @UsePipes(new ValidationPipe())
  login(@Body() loginUsuarioDto: LoginUsuarioDto) {
    return this.usuariosService.login(loginUsuarioDto);
  }

  @Post('usuarios')
  @UsePipes(new ValidationPipe())
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get('usuarios')
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.usuariosService.findAll();
  }

  // REMOVED /me endpoints as requested.
  // Frontend must use /usuarios/:id with the ID from the token.

  @Get('usuarios/:id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    console.log(`[DEBUG] GET /usuarios/${id} - Requesting...`);
    
    // Security Check: User can only view their own profile
    if (Number(id) !== Number(user.sub)) {
       throw new ForbiddenException('No tienes permiso para ver este perfil.');
    }
    return this.usuariosService.findOne(+id);
  }

  @Patch('usuarios/:id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
    @CurrentUser() user: any,
  ) {
    // Security Check: User can only update their own profile
    if (Number(id) !== Number(user.sub)) {
       throw new ForbiddenException('No tienes permiso para editar este perfil.');
    }
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Delete('usuarios/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(+id);
  }
}
