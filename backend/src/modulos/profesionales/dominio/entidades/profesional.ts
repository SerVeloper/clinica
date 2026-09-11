export class Profesional {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly apellido: string,
    public readonly telefono: string | null,
    public readonly especialidadId: string,
    public readonly activo: boolean,
    public readonly creadoEn: Date,
    public readonly actualizadoEn: Date,
  ) {}
}
