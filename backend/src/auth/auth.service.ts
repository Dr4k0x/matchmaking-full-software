import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  generateToken(payload: JwtPayload) {
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
