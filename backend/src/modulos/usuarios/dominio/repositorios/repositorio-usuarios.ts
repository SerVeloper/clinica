import { RolUsuario } from '../entidades/rol-usuario';
import { Usuario } from '../entidades/usuario';

export const REPOSITORIO_USUARIOS = Symbol('REPOSITORIO_USUARIOS');

export interface DatosCrearUsuario {
  nombre: string;
  apellido: string;
  usuario: string;
  passwordHash: string;
  rol: RolUsuario;
  profesionalId: string | null;
  activo: boolean;
}

export interface RepositorioUsuarios {
  guardar(datos: DatosCrearUsuario): Promise<Usuario>;
  listar(): Promise<Usuario[]>;
  buscarPorId(id: string): Promise<Usuario | null>;
  buscarPorUsuario(usuario: string): Promise<Usuario | null>;
}
