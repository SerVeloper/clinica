import { Inject, Injectable } from '@nestjs/common';
import { ErrorNegocio } from '../../../../compartido/dominio/error-negocio';
import { REPOSITORIO_RESERVAS, RepositorioReservas } from '../../dominio/repositorios/repositorio-reservas';

@Injectable()
export class ObtenerReservaCasoUso {
  constructor(@Inject(REPOSITORIO_RESERVAS) private readonly repositorio: RepositorioReservas) {}

  async ejecutar(id: string) {
    const reserva = await this.repositorio.buscarPorId(id);
    if (!reserva) throw new ErrorNegocio('Reserva no encontrada');
    return reserva;
  }
}
