import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { MatchmakingService } from './matchmaking.service';
import { CreateMatchmakingDto } from './dto/create-matchmaking.dto';

import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { JwtPayload } from 'src/auth/jwt-payload.interface';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UseGuards, UnauthorizedException } from '@nestjs/common';

@Controller('matchmaking')
@UseGuards(JwtAuthGuard)
export class MatchmakingController {
  constructor(private readonly matchmakingService: MatchmakingService) {}

  @Post('preview')
  preview(
    @Body() dto: CreateMatchmakingDto,
    @CurrentUser() user: JwtPayload | undefined,
  ) {
    if (!user) throw new UnauthorizedException('Usuario no autorizado');
    return this.matchmakingService.preview(dto, user);
  }

  @Post()
  create(
    @Body() dto: CreateMatchmakingDto,
    @CurrentUser() user: JwtPayload | undefined,
  ) {
    if (!user) throw new UnauthorizedException('Usuario no autorizado');
    return this.matchmakingService.create(dto, user);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload | undefined) {
    if (!user) throw new UnauthorizedException('Usuario no autorizado');
    return this.matchmakingService.findAll(user);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload | undefined,
  ) {
    if (!user) throw new UnauthorizedException('Usuario no autorizado');
    return this.matchmakingService.findOne(+id, user);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload | undefined,
  ) {
    if (!user) throw new UnauthorizedException('Usuario no autorizado');
    return this.matchmakingService.remove(+id, user);
  }
}
