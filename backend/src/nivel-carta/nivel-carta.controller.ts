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
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { NivelCartaService } from './nivel-carta.service';
import { CreateNivelCartaDto } from './dto/create-nivel-carta.dto';
import { UpdateNivelCartaDto } from './dto/update-nivel-carta.dto';
import { FindNivelCartaDto } from './dto/find-nivel-carta.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('nivel-carta')
@UseGuards(JwtAuthGuard)
export class NivelCartaController {
  constructor(private readonly nivelCartaService: NivelCartaService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  create(@Body() createNivelCartaDto: CreateNivelCartaDto) {
    return this.nivelCartaService.create(createNivelCartaDto);
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(@Query() query: FindNivelCartaDto) {
    return this.nivelCartaService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.nivelCartaService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNivelCartaDto: UpdateNivelCartaDto,
  ) {
    return this.nivelCartaService.update(id, updateNivelCartaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.nivelCartaService.remove(id);
  }
}
