import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { Usuario } from '../../dominio/entidades/usuario';
import { LoginDto } from '../dtos/login.dto';
import { PasswordServicio } from './password.servicio';
import { UsuariosServicio } from './usuarios.servicio';

export interface UsuarioAutenticado {
  id: string;
  usuario: string;
  nombre: string;
  apellido: string;
  rol: Usuario['rol'];
  profesionalId: string | null;
}

@Injectable()
export class AuthServicio {
  private readonly secreto: string;

  constructor(
    config: ConfigService,
    private readonly usuarios: UsuariosServicio,
    private readonly passwords: PasswordServicio,
  ) {
    this.secreto = config.get<string>('AUTH_SECRETO', 'clinica-local-auth-secret');
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuarios.buscarPorUsuario(dto.usuario.trim());
    if (!usuario || !usuario.activo) throw new UnauthorizedException('Usuario o contraseña inválidos');

    const passwordValido = await this.passwords.verificar(dto.password, usuario.passwordHash);
    if (!passwordValido) throw new UnauthorizedException('Usuario o contraseña inválidos');

    return {
      token: this.firmar({ sub: usuario.id, iat: Date.now() }),
      usuario: this.usuarios.sinPassword(usuario),
    };
  }

  async obtenerUsuarioDesdeHeader(authorization?: string): Promise<UsuarioAutenticado> {
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
    const payload = token ? this.verificar(token) : null;
    if (!payload?.sub) throw new UnauthorizedException('Sesión requerida');

    const usuario = await this.usuarios.buscarPorId(payload.sub);
    if (!usuario || !usuario.activo) throw new UnauthorizedException('Sesión inválida');

    return {
      id: usuario.id,
      usuario: usuario.usuario,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rol: usuario.rol,
      profesionalId: usuario.profesionalId,
    };
  }

  private firmar(payload: Record<string, unknown>) {
    const cuerpo = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${cuerpo}.${this.firma(cuerpo)}`;
  }

  private verificar(token: string): { sub?: string } | null {
    const [cuerpo, firma] = token.split('.');
    if (!cuerpo || !firma) return null;

    const firmaEsperada = this.firma(cuerpo);
    const firmaIngresadaBuffer = Buffer.from(firma);
    const firmaEsperadaBuffer = Buffer.from(firmaEsperada);
    if (firmaIngresadaBuffer.length !== firmaEsperadaBuffer.length || !timingSafeEqual(firmaIngresadaBuffer, firmaEsperadaBuffer)) return null;

    try {
      return JSON.parse(Buffer.from(cuerpo, 'base64url').toString('utf8')) as { sub?: string };
    } catch {
      return null;
    }
  }

  private firma(cuerpo: string) {
    return createHmac('sha256', this.secreto).update(cuerpo).digest('base64url');
  }
}
