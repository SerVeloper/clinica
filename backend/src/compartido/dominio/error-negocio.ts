export class ErrorNegocio extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorNegocio';
  }
}
