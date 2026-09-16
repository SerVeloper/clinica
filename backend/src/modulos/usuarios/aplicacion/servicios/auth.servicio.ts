import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { SesionesServicio } from '../../../sesiones/aplicacion/servicios/sesiones.servicio';
import { Usuario } from '../../dominio/entidades/usuario';
import { LoginDto } from '../dtos/login.dto';
import { PasswordServicio } from './password.servicio';
import { UsuarioRespuesta, UsuariosServicio } from './usuarios.servicio';

export interface UsuarioAutenticado {
  id: string;
  usuario: string;
  nombre: string;
  apellido: string;
  rol: Usuario['rol'];
  profesionalId: string | null;
}

export interface RespuestaLogueo {
  token: string;
  refreshToken: string;
  expiraEn: Date;
  usuario: UsuarioRespuesta;
}

@Injectable()
export class AuthServicio {
  private readonly secreto: string;
  private readonly ttlAccesoMin: number;
  private readonly ttlRefrescoHoras: number;

  constructor(
    config: ConfigService,
    private readonly usuarios: UsuariosServicio,
    private readonly passwords: PasswordServicio,
    private readonly sesiones: SesionesServicio,
  ) {
    const secreto = config.get<string>('AUTH_SECRETO');
    if (!secreto) throw new Error('AUTH_SECRETO es obligatorio para iniciar el servidor');

    this.secreto = secreto;
    this.ttlAccesoMin = this.validarTtl(Number(config.get<string>('ACCESS_TOKEN_TTL_MIN') ?? 30), 'ACCESS_TOKEN_TTL_MIN');
    this.ttlRefrescoHoras = this.validarTtl(Number(config.get<string>('REFRESH_TOKEN_TTL_HOURS') ?? 24), 'REFRESH_TOKEN_TTL_HOURS');
  }

  async login(dto: LoginDto): Promise<RespuestaLogueo> {
    const usuario = await this.usuarios.buscarPorUsuario(dto.usuario.trim());
    if (!usuario || !usuario.activo) throw new UnauthorizedException('Usuario o contraseña inválidos');

    const passwordValido = await this.passwords.verificar(dto.password, usuario.passwordHash);
    if (!passwordValido) throw new UnauthorizedException('Usuario o contraseña inválidos');

    const { refreshToken, expiraEn } = await this.sesiones.crear(usuario.id, this.ttlRefrescoHoras);

    return {
      token: this.firmar({ sub: usuario.id }),
      refreshToken,
      expiraEn,
      usuario: this.usuarios.sinPassword(usuario),
    };
  }

  async refrescar(refreshToken: string): Promise<RespuestaLogueo> {
    const rotada = await this.sesiones.rotar(refreshToken, this.ttlRefrescoHoras);
    if (!rotada) throw new UnauthorizedException('Sesión inválida o expirada');

    const usuario = await this.usuarios.buscarPorId(rotada.usuarioId);
    if (!usuario || !usuario.activo) throw new UnauthorizedException('Sesión inválida');

    return {
      token: this.firmar({ sub: usuario.id }),
      refreshToken: rotada.refreshToken,
      expiraEn: rotada.expiraEn,
      usuario: this.usuarios.sinPassword(usuario),
    };
  }

  async revocar(refreshToken: string): Promise<void> {
    await this.sesiones.revocar(refreshToken);
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

  private firmar(payload: Record<string, unknown>): string {
    const ahora = Math.floor(Date.now() / 1000);
    const cuerpo = Buffer.from(JSON.stringify({ ...payload, iat: ahora, exp: ahora + this.ttlAccesoMin * 60 })).toString('base64url');
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
      const payload = JSON.parse(Buffer.from(cuerpo, 'base64url').toString('utf8')) as { sub?: string; exp?: unknown };
      if (typeof payload.exp !== 'number' || !Number.isFinite(payload.exp)) return null;
      if (payload.exp <= Date.now() / 1000) return null;
      return payload;
    } catch {
      return null;
    }
  }

  private firma(cuerpo: string): string {
    return createHmac('sha256', this.secreto).update(cuerpo).digest('base64url');
  }

  private validarTtl(valor: number, nombre: string): number {
    if (!Number.isFinite(valor) || valor <= 0) {
      throw new Error(`${nombre} debe ser un número positivo`);
    }
    return valor;
  }
}