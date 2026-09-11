import { ErrorNegocio } from '../../../../compartido/dominio/error-negocio';
import { EstadoReserva } from './estado-reserva';

const ESTADOS_TERMINALES: EstadoReserva[] = [EstadoReserva.ATENDIDA, EstadoReserva.NO_ASISTIO, EstadoReserva.CANCELADA];

export class Reserva {
  constructor(
    public readonly id: string,
    public readonly pacienteId: string,
    public readonly profesionalId: string,
    public readonly especialidadId: string,
    public readonly fechaInicio: Date,
    public readonly fechaFin: Date,
    public readonly estado: EstadoReserva,
    public readonly creadoPorUsuarioId: string | null,
    public readonly creadoEn: Date,
    public readonly actualizadoEn: Date,
    public readonly canceladoEn: Date | null,
  ) {}

  static calcularFechaFin(fechaInicio: Date, duracionMinutos: number): Date {
    return new Date(fechaInicio.getTime() + duracionMinutos * 60_000);
  }

  static haySolapamiento(nuevaFechaInicio: Date, nuevaFechaFin: Date, existente: Reserva): boolean {
    return nuevaFechaInicio < existente.fechaFin && nuevaFechaFin > existente.fechaInicio;
  }

  cancelar(fechaCancelacion: Date): Reserva {
    if (this.estado === EstadoReserva.CANCELADA) {
      throw new ErrorNegocio('La reserva ya está cancelada');
    }
    if (this.esEstadoTerminal()) {
      throw new ErrorNegocio('No se puede cancelar una reserva en estado terminal');
    }

    return new Reserva(
      this.id,
      this.pacienteId,
      this.profesionalId,
      this.especialidadId,
      this.fechaInicio,
      this.fechaFin,
      EstadoReserva.CANCELADA,
      this.creadoPorUsuarioId,
      this.creadoEn,
      this.actualizadoEn,
      fechaCancelacion,
    );
  }

  cambiarEstado(estado: EstadoReserva, fechaCambio: Date): Reserva {
    if (this.estado === estado) return this;
    if (this.esEstadoTerminal()) {
      throw new ErrorNegocio('No se puede cambiar el estado de una reserva en estado terminal');
    }
    if (estado === EstadoReserva.CANCELADA) return this.cancelar(fechaCambio);

    return new Reserva(
      this.id,
      this.pacienteId,
      this.profesionalId,
      this.especialidadId,
      this.fechaInicio,
      this.fechaFin,
      estado,
      this.creadoPorUsuarioId,
      this.creadoEn,
      this.actualizadoEn,
      null,
    );
  }

  private esEstadoTerminal(): boolean {
    return ESTADOS_TERMINALES.includes(this.estado);
  }
}
