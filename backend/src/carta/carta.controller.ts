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
} from '@nestjs/common';

import { CartaService } from './carta.service';
import { CreateCartaDto } from './dto/create-carta.dto';
import { UpdateCartaDto } from './dto/update-carta.dto';
import { AsignarMatchmakingDto } from './dto/assing-matchmaking';

import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { JwtPayload } from 'src/auth/jwt-payload.interface';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('carta')
@UseGuards(JwtAuthGuard)
export class CartaController {
  constructor(private readonly cartaService: CartaService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  create(
    @Body() dto: CreateCartaDto,
    @CurrentUser() user: JwtPayload | undefined,
  ) {
    if (!user) throw new UnauthorizedException('Usuario no autorizado');
    return this.cartaService.create(dto, user);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload | undefined) {
    if (!user) throw new UnauthorizedException('Usuario no autorizado');
    return this.cartaService.findAll(user);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload | undefined,
  ) {
    if (!user) throw new UnauthorizedException('Usuario no autorizado');
    return this.cartaService.findOne(id, user);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCartaDto,
    @CurrentUser() user: JwtPayload | undefined,
  ) {
    if (!user) throw new UnauthorizedException('Usuario no autorizado');
    return this.cartaService.update(id, dto, user);
  }

  @Patch(':id/matchmaking')
  @UsePipes(new ValidationPipe())
  asignarMatchmaking(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AsignarMatchmakingDto,
    @CurrentUser() user: JwtPayload | undefined,
  ) {
    if (!user) throw new UnauthorizedException('Usuario no autorizado');
    return this.cartaService.asignarMatchmaking(id, dto.matchmakingId, user);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload | undefined,
  ) {
    if (!user) throw new UnauthorizedException('Usuario no autorizado');
    return this.cartaService.remove(id, user);
  }
}
