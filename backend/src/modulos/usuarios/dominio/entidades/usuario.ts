import { RolUsuario } from './rol-usuario';

export class Usuario {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly apellido: string,
    public readonly usuario: string,
    public readonly passwordHash: string,
    public readonly rol: RolUsuario,
    public readonly profesionalId: string | null,
    public readonly activo: boolean,
    public readonly creadoEn: Date,
    public readonly actualizadoEn: Date,
  ) {}
}
