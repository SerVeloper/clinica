export type CodigoErrorNegocio = 'NO_ENCONTRADO';

export class ErrorNegocio extends Error {
  constructor(
    mensaje: string,
    readonly codigo?: CodigoErrorNegocio,
  ) {
    super(mensaje);
    this.name = 'ErrorNegocio';
  }
}