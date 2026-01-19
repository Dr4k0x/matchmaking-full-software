import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Carta } from './entities/carta.entity';
import { CreateCartaDto } from './dto/create-carta.dto';
import { UpdateCartaDto } from './dto/update-carta.dto';

import { JwtPayload } from 'src/auth/jwt-payload.interface';
import { Matchmaking } from 'src/matchmaking/entities/matchmaking.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { NivelCartaService } from 'src/nivel-carta/nivel-carta.service';

@Injectable()
export class CartaService {
  constructor(
    @InjectRepository(Carta)
    private readonly cartaRepo: Repository<Carta>,
    private readonly nivelCartaService: NivelCartaService,
  ) { }

  async create(dto: CreateCartaDto, user: JwtPayload) {
    // 1️⃣ relation data
    const newLevels = dto.nivelesCarta;
    
    // 2️⃣ Prepare Carta payload (sin relaciones)
    const cartaPayload = {
      nombreApellido: dto.nombreApellido,
      cedulaIdentidad: dto.cedulaIdentidad,
      tipoCarta: dto.tipoCarta,
      poderSocial: dto.poderSocial,
      sabiduria: dto.sabiduria,
      velocidad: dto.velocidad,
      usuario: { idUsuario: user.sub } as Usuario,
    };

    let savedCarta;
    
    // 3️⃣ Transactional-like Steps
    try {
      const nuevaCarta = this.cartaRepo.create(cartaPayload);
      savedCarta = await this.cartaRepo.save(nuevaCarta);

      // 4️⃣ Handle Levels creation if array exists and has items
      if (Array.isArray(newLevels) && newLevels.length > 0) {
        await this.nivelCartaService.createMany(
          { niveles: newLevels as any },
          savedCarta.idCarta,
        );
      }
      
      return { message: 'Carta creada con éxito', id: savedCarta.idCarta };
    } catch (e) {
      console.error('Error create carta:', e);
      throw new InternalServerErrorException('Error al crear la carta');
    }
  }

  // ✅ Listar cartas del usuario logueado
  async findAll(user: JwtPayload): Promise<Carta[]> {
    try {
      return await this.cartaRepo.find({
        where: { usuario: { idUsuario: user.sub } as Usuario },
        relations: ['nivelesCarta', 'nivelesCarta.tecnologia'], // Optional: Bring levels implicitly?
      });
    } catch (e) {
      throw new InternalServerErrorException('Error al obtener las cartas');
    }
  }

  // ✅ Obtener 1 carta del usuario logueado
  async findOne(id: number, user: JwtPayload): Promise<Carta> {
    try {
      const carta = await this.cartaRepo.findOne({
        where: {
          idCarta: id,
          usuario: { idUsuario: user.sub } as any,
        },
        relations: ['nivelesCarta', 'nivelesCarta.tecnologia'], // Load levels for form
      });

      if (!carta) throw new NotFoundException('Carta no encontrada');
      return carta;
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new InternalServerErrorException('Error al obtener la carta');
    }
  }

  // ✅ Update robusto (maneja 0 tecnologias y consistencia)
  async update(id: number, dto: UpdateCartaDto, user: JwtPayload) {
    // 1️⃣ Verify ownership first
    const existing = await this.findOne(id, user); 
    if (!existing) throw new NotFoundException('Carta no encontrada');

    // 2️⃣ Relation Data (nivelesCarta)
    // If it's undefined, it means we don't want to touch it.
    // If it's [], we want to clear it.
    const newLevels = dto.nivelesCarta;
    
    // 3️⃣ Scalar Data (Filtering out relations)
    const { nivelesCarta, ...scalarFields } = dto;

    try {
      // 4️⃣ Update Scalar Fields (if any)
      if (Object.keys(scalarFields).length > 0) {
        await this.cartaRepo.update(id, scalarFields as any);
      }

      // 5️⃣ Update Relation (Niveles) ONLY if provided
      if (newLevels !== undefined) {
        // Strategy: Wipe and Replace
        await this.nivelCartaService.removeAllByCarta(id);

        if (Array.isArray(newLevels) && newLevels.length > 0) {
           await this.nivelCartaService.createMany(
            { niveles: newLevels as any },
            id,
          );
        }
      }

      return this.findOne(id, user); 
    } catch (e) {
      console.error('Error update carta:', e);
      throw new InternalServerErrorException('Error al actualizar la carta');
    }
  }

  // ✅ Asignar matchmaking después
  async asignarMatchmaking(
    idCarta: number,
    matchmakingId: number,
    user: JwtPayload,
  ) {
    try {
      const result = await this.cartaRepo.update(
        { idCarta: idCarta, usuario: { idUsuario: user.sub } as any },
        {
          // ⚠️ ajusta si tu PK en Matchmaking no se llama idMatchmaking
          matchmaking: { idMatchmaking: matchmakingId } as Matchmaking,
        } as any,
      );

      if (!result.affected) throw new NotFoundException('Carta no encontrada');
      return this.findOne(idCarta, user);
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new InternalServerErrorException('Error al asignar matchmaking');
    }
  }

  // ✅ Delete scoped + affected
  async remove(id: number, user: JwtPayload) {
    try {
      const result = await this.cartaRepo.delete({
        idCarta: id,
        usuario: { idUsuario: user.sub } as any,
      });

      if (!result.affected) throw new NotFoundException('Carta no encontrada');
      return { message: 'Carta eliminada correctamente' };
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new InternalServerErrorException('Error al eliminar la carta');
    }
  }
}
