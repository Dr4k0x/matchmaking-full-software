export interface JwtPayload {
  sub: number; //? Es el 'id' del usuario
  nombre: string;
  email: string;
}
