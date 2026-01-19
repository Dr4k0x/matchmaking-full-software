import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  Inject,
  forwardRef,
  ConflictException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async login(loginUsuarioDto: LoginUsuarioDto) {
    const usuario = await this.usuarioRepository.findOne({
      where: { email: loginUsuarioDto.email },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      loginUsuarioDto.password,
      usuario.passkey,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = this.authService.generateToken({
      sub: usuario.idUsuario,
      nombre: usuario.nombre,
      email: usuario.email,
    });

    return {
      message: 'Login exitoso',
      ...token,
    };
  }

  async create(createUsuarioDto: CreateUsuarioDto) {
    // Check for duplicate email
    const existingUser = await this.usuarioRepository.findOne({
      where: { email: createUsuarioDto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        'Este correo ya está registrado. Por favor usa otro correo.',
      );
    }

    const hashedPassword = await bcrypt.hash(createUsuarioDto.password, 10);
    const user = { passkey: hashedPassword, ...createUsuarioDto };

    try {
      await this.usuarioRepository.save(user);
    } catch {
      throw new InternalServerErrorException('Error al crear el usuario');
    }

    return { message: 'Usuario creado correctamente' };
  }

  findAll() {
    return `This action returns all usuarios`;
  }

  async findOne(id: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: { idUsuario: id },
    });
    if (!usuario) return null;
    const { passkey, ...safeUser } = usuario;
    return safeUser;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.usuarioRepository.findOne({
      where: { idUsuario: id },
    });

    if (!usuario) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const { password, ...rest } = updateUsuarioDto;
    const updateData: Partial<Usuario> = { ...rest };

    if (password && typeof password === 'string') {
      updateData.passkey = await bcrypt.hash(password, 10);
    }

    try {
      await this.usuarioRepository.update(id, updateData);
    } catch {
      throw new InternalServerErrorException('Error al actualizar el usuario');
    }

    return { message: 'Usuario actualizado correctamente' };
  }

  async updateNombre(id: number, dto: UpdateProfileDto) {
    const usuario = await this.usuarioRepository.findOne({
      where: { idUsuario: id },
    });

    if (!usuario) {
      throw new BadRequestException('Usuario no encontrado'); // OR NotFoundException
    }

    usuario.nombre = dto.nombre;

    try {
      await this.usuarioRepository.save(usuario);
    } catch {
      throw new InternalServerErrorException('Error al actualizar el nombre del usuario');
    }

    // Return safe user object
    const { passkey, ...safeUser } = usuario;
    return { message: 'Nombre actualizado correctamente', user: safeUser };
  }

  remove(id: number) {
    return `This action removes a #${id} usuario as a joke`;
  }
}
