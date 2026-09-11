import { Inject, Injectable } from '@nestjs/common';
import { ErrorNegocio } from '../../../../compartido/dominio/error-negocio';
import { EstadoReserva } from '../../dominio/entidades/estado-reserva';
import { Reserva } from '../../dominio/entidades/reserva';
import { REPOSITORIO_RESERVAS, RepositorioReservas } from '../../dominio/repositorios/repositorio-reservas';
import { ActualizarEstadoReservaDto } from '../dtos/actualizar-estado-reserva.dto';

@Injectable()
export class ActualizarEstadoReservaCasoUso {
  constructor(@Inject(REPOSITORIO_RESERVAS) private readonly repositorio: RepositorioReservas) {}

  async ejecutar(id: string, dto: ActualizarEstadoReservaDto) {
    const reserva = await this.repositorio.buscarPorId(id);
    if (!reserva) throw new ErrorNegocio('Reserva no encontrada');

    if ([EstadoReserva.CONFIRMADA, EstadoReserva.ATENDIDA].includes(dto.estado)) {
      const solapadas = await this.repositorio.buscarConfirmadasSolapadas(reserva.profesionalId, reserva.fechaInicio, reserva.fechaFin);
      if (solapadas.some((existente) => existente.id !== reserva.id && Reserva.haySolapamiento(reserva.fechaInicio, reserva.fechaFin, existente))) {
        throw new ErrorNegocio('El profesional ya tiene una reserva ocupando ese rango horario');
      }
    }

    return this.repositorio.actualizar(reserva.cambiarEstado(dto.estado, new Date()));
  }
}
