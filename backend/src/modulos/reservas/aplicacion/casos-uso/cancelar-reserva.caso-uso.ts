import { Inject, Injectable } from '@nestjs/common';
import { ErrorNegocio } from '../../../../compartido/dominio/error-negocio';
import { UsuarioAutenticado } from '../../../usuarios/aplicacion/servicios/auth.servicio';
import { REPOSITORIO_RESERVAS, RepositorioReservas } from '../../dominio/repositorios/repositorio-reservas';
import { verificarAccesoReserva } from '../servicios/verificar-acceso-reserva';

@Injectable()
export class CancelarReservaCasoUso {
  constructor(@Inject(REPOSITORIO_RESERVAS) private readonly repositorio: RepositorioReservas) {}

  async ejecutar(id: string, usuario: UsuarioAutenticado) {
    const reserva = await this.repositorio.buscarPorId(id);
    if (!reserva) throw new ErrorNegocio('Reserva no encontrada', 'NO_ENCONTRADO');
    verificarAccesoReserva(reserva, usuario);

    return this.repositorio.actualizar(reserva.cancelar(new Date()));
  }
}