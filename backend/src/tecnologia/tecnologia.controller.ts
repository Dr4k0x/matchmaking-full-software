import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Query,
  ParseIntPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { TecnologiaService } from './tecnologia.service';
import { CreateTecnologiaDto } from './dto/create-tecnologia.dto';
import { UpdateTecnologiaDto } from './dto/update-tecnologia.dto';
import { FindTecnologiaDto } from './dto/find-tecnologia.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from 'src/auth/jwt-payload.interface';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('tecnologia')
@UseGuards(JwtAuthGuard)
export class TecnologiaController {
  constructor(private readonly tecnologiaService: TecnologiaService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  create(
    @Body() createTecnologiaDto: CreateTecnologiaDto,
    @CurrentUser() user: JwtPayload | undefined,
  ) {
    if (!user) {
      throw new UnauthorizedException('Usuario no autorizado');
    }
    return this.tecnologiaService.create(createTecnologiaDto, user);
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(
    @Query() query: FindTecnologiaDto,
    @CurrentUser() user: JwtPayload | undefined,
  ) {
    if (!user) throw new UnauthorizedException('Usuario no autorizado');
    return this.tecnologiaService.findAll(query, user);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload | undefined,
  ) {
    if (!user) throw new UnauthorizedException('Usuario no autorizado');
    return this.tecnologiaService.findOne(id, user);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTecnologiaDto: UpdateTecnologiaDto,
    @CurrentUser() user: JwtPayload | undefined,
  ) {
    if (!user) {
      throw new UnauthorizedException('Usuario no autorizado');
    }
    return this.tecnologiaService.update(id, updateTecnologiaDto, user);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload | undefined,
  ) {
    if (!user) throw new UnauthorizedException('Usuario no autorizado');
    return this.tecnologiaService.remove(id, user);
  }
}
