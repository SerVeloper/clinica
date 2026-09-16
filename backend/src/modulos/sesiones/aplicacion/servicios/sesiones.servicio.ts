import { Inject, Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { Sesion } from '../../dominio/entidades/sesion';
import { REPOSITORIO_SESIONES, RepositorioSesiones } from '../../dominio/repositorios/repositorio-sesiones';

export interface SesionCreada {
  refreshToken: string;
  expiraEn: Date;
}

export interface SesionRotada {
  usuarioId: string;
  refreshToken: string;
  expiraEn: Date;
}

@Injectable()
export class SesionesServicio {
  constructor(@Inject(REPOSITORIO_SESIONES) private readonly repositorio: RepositorioSesiones) {}

  async crear(usuarioId: string, ttlHoras: number): Promise<SesionCreada> {
    const refreshToken = this.generarToken();
    const expiraEn = this.calcularExpiracion(ttlHoras);
    await this.repositorio.guardar({ usuarioId, tokenHash: this.sha256(refreshToken), expiraEn });
    return { refreshToken, expiraEn };
  }

  async validar(refreshToken: string): Promise<Sesion | null> {
    const sesion = await this.repositorio.buscarActivaPorHash(this.sha256(refreshToken));
    if (!sesion || sesion.revocado || sesion.expiraEn.getTime() <= Date.now()) return null;
    return sesion;
  }

  async rotar(refreshToken: string, ttlHoras: number): Promise<SesionRotada | null> {
    const nuevoRefreshToken = this.generarToken();
    const expiraEn = this.calcularExpiracion(ttlHoras);
    const resultado = await this.repositorio.rotarAtómicamente(
      this.sha256(refreshToken),
      this.sha256(nuevoRefreshToken),
      expiraEn,
    );
    if (!resultado) return null;
    return { usuarioId: resultado.sesion.usuarioId, refreshToken: nuevoRefreshToken, expiraEn };
  }

  async revocar(refreshToken: string): Promise<void> {
    await this.repositorio.revocarPorHash(this.sha256(refreshToken));
  }

  private generarToken(): string {
    return randomBytes(32).toString('base64url');
  }

  private calcularExpiracion(ttlHoras: number): Date {
    return new Date(Date.now() + ttlHoras * 60 * 60 * 1000);
  }

  private sha256(valor: string): string {
    return createHash('sha256').update(valor).digest('hex');
  }
}