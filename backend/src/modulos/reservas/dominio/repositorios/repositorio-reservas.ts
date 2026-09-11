import { EstadoReserva } from '../entidades/estado-reserva';
import { Reserva } from '../entidades/reserva';

export const REPOSITORIO_RESERVAS = Symbol('REPOSITORIO_RESERVAS');

export interface FiltrosReservas {
  fecha?: string;
  profesionalId?: string;
  pacienteId?: string;
  especialidadId?: string;
  estado?: EstadoReserva;
}

export interface DatosCrearReserva {
  pacienteId: string;
  profesionalId: string;
  especialidadId: string;
  fechaInicio: Date;
  fechaFin: Date;
  estado: EstadoReserva;
  creadoPorUsuarioId: string | null;
  canceladoEn: Date | null;
}

export interface RepositorioReservas {
  guardar(datos: DatosCrearReserva): Promise<Reserva>;
  actualizar(reserva: Reserva): Promise<Reserva>;
  listar(filtros: FiltrosReservas): Promise<Reserva[]>;
  buscarPorId(id: string): Promise<Reserva | null>;
  buscarConfirmadasSolapadas(profesionalId: string, fechaInicio: Date, fechaFin: Date): Promise<Reserva[]>;
}
