export class Sesion {
  constructor(
    public readonly id: string,
    public readonly usuarioId: string,
    public readonly tokenHash: string,
    public readonly expiraEn: Date,
    public readonly revocado: boolean,
    public readonly creadoEn: Date,
  ) {}
}