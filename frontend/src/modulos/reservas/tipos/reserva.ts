export type EstadoReserva = 'PENDIENTE' | 'CONFIRMADA' | 'ATENDIDA' | 'NO_ASISTIO' | 'CANCELADA'

export interface Reserva {
  id: string
  pacienteId: string
  profesionalId: string
  especialidadId: string
  fechaInicio: string
  fechaFin: string
  estado: EstadoReserva
  creadoPorUsuarioId: string | null
  canceladoEn: string | null
}

export interface CrearReservaPayload {
  pacienteId: string
  profesionalId: string
  especialidadId: string
  fechaInicio: string
  estado?: EstadoReserva
}

export interface ActualizarEstadoReservaPayload {
  estado: EstadoReserva
}

export interface FiltrosReservas {
  fecha?: string
  profesionalId?: string
  pacienteId?: string
  especialidadId?: string
  estado?: EstadoReserva | ''
}
