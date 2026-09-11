import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ErrorNegocio } from '../../dominio/error-negocio';

export function mapearError(error: unknown): never {
  if (error instanceof ErrorNegocio) {
    throw new BadRequestException(error.message);
  }

  if (error instanceof Error && error.message.toLowerCase().includes('no encontrado')) {
    throw new NotFoundException(error.message);
  }

  throw error;
}
