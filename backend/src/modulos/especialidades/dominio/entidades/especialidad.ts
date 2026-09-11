export class Especialidad {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly duracionMinutos: number,
    public readonly activo: boolean,
    public readonly creadoEn: Date,
    public readonly actualizadoEn: Date,
  ) {}
}
