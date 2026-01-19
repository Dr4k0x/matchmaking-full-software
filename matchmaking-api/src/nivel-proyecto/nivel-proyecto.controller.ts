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
import { NivelProyectoService } from './nivel-proyecto.service';
import { CreateNivelProyectoDto } from './dto/create-nivel-proyecto.dto';
import { UpdateNivelProyectoDto } from './dto/update-nivel-proyecto.dto';
import { FindNivelProyectoDto } from './dto/find-nivel-proyecto.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('nivel-proyecto')
@UseGuards(JwtAuthGuard)
export class NivelProyectoController {
  constructor(private readonly nivelProyectoService: NivelProyectoService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  create(@Body() createNivelProyectoDto: CreateNivelProyectoDto) {
    return this.nivelProyectoService.create(createNivelProyectoDto);
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(@Query() query: FindNivelProyectoDto) {
    return this.nivelProyectoService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.nivelProyectoService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNivelProyectoDto: UpdateNivelProyectoDto,
  ) {
    return this.nivelProyectoService.update(id, updateNivelProyectoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.nivelProyectoService.remove(id);
  }
}
