import { clienteApi } from '../../../compartido/api/cliente-api'
import type { ActualizarEstadoReservaPayload, CrearReservaPayload, FiltrosReservas, Reserva } from '../tipos/reserva'

export function listarReservas(filtros: FiltrosReservas = {}) {
  return clienteApi<Reserva[]>('/reservas', { parametros: filtros })
}

export function crearReserva(payload: CrearReservaPayload) {
  return clienteApi<Reserva>('/reservas', { metodo: 'POST', cuerpo: payload })
}

export function cancelarReserva(id: string) {
  return clienteApi<Reserva>(`/reservas/${id}/cancelar`, { metodo: 'PATCH' })
}

export function actualizarEstadoReserva(id: string, payload: ActualizarEstadoReservaPayload) {
  return clienteApi<Reserva>(`/reservas/${id}/estado`, { metodo: 'PATCH', cuerpo: payload })
}
