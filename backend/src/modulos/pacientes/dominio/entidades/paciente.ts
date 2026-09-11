export class Paciente {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly apellido: string,
    public readonly telefono: string,
    public readonly email: string | null,
    public readonly activo: boolean,
    public readonly creadoEn: Date,
    public readonly actualizadoEn: Date,
  ) {}
}
