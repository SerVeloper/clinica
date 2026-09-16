import { Sesion } from '../entidades/sesion';

export const REPOSITORIO_SESIONES = Symbol('REPOSITORIO_SESIONES');

export interface DatosCrearSesion {
  usuarioId: string;
  tokenHash: string;
  expiraEn: Date;
}

export interface RepositorioSesiones {
  guardar(datos: DatosCrearSesion): Promise<Sesion>;
  buscarActivaPorHash(tokenHash: string): Promise<Sesion | null>;
  rotarAtómicamente(
    tokenHash: string,
    nuevoTokenHash: string,
    nuevaExpiracion: Date,
  ): Promise<{ sesion: Sesion } | null>;
  revocarPorHash(tokenHash: string): Promise<void>;
}