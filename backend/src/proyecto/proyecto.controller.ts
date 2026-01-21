import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { ProyectoService } from './proyecto.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { UpdateEstadoProyectoDto } from './dto/update-estado-proyecto.dto';
import { FindProyectoDto } from './dto/find-proyecto.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { JwtPayload } from 'src/auth/jwt-payload.interface';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('proyecto')
@UseGuards(JwtAuthGuard)
export class ProyectoController {
  constructor(private readonly proyectoService: ProyectoService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  create(
    @Body() createProyectoDto: CreateProyectoDto,
    @CurrentUser() user: JwtPayload | undefined,
  ) {
    if (!user) {
      throw new UnauthorizedException('Usuario no autorizado');
    }
    return this.proyectoService.create(createProyectoDto, user);
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(
    @Query() queryParams: FindProyectoDto,
    @CurrentUser() user: JwtPayload | undefined,
  ) {
    if (!user) {
      throw new UnauthorizedException('Usuario no autorizado');
    }
    return this.proyectoService.findAll(user, queryParams);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload | undefined,
  ) {
    if (!user) throw new UnauthorizedException('Usuario no autorizado');
    return this.proyectoService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProyectoDto: UpdateProyectoDto,
    @CurrentUser() user: JwtPayload | undefined,
  ) {
    if (!user) throw new UnauthorizedException('Usuario no autorizado');
    return this.proyectoService.update(id, updateProyectoDto, user);
  }

  @Patch(':id/estado')
  @UsePipes(new ValidationPipe())
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEstadoDto: UpdateEstadoProyectoDto,
    @CurrentUser() user: JwtPayload | undefined,
  ) {
    if (!user) throw new UnauthorizedException('Usuario no autorizado');
    return this.proyectoService.updateEstado(id, updateEstadoDto, user);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload | undefined,
  ) {
    if (!user) throw new UnauthorizedException('Usuario no autorizado');
    return this.proyectoService.remove(id, user);
  }
}
