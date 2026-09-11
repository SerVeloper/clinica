import { clienteApi } from '../../../compartido/api/cliente-api'
import type { FiltrosPaginacion, RespuestaPaginada } from '../../../compartido/tipos/paginacion'
import type { ActualizarEstadoProfesionalPayload, ActualizarProfesionalPayload, CrearProfesionalPayload, Profesional } from '../tipos/profesional'

const LIMITE_LISTA_COMPLETA = 100

export interface FiltrosProfesionales extends FiltrosPaginacion {
  especialidadId?: string
  activo?: string
}

export function listarProfesionales() {
  return listarProfesionalesPaginado({ limite: LIMITE_LISTA_COMPLETA }).then((respuesta) => respuesta.datos)
}

export function listarProfesionalesPaginado(filtros: FiltrosProfesionales = {}) {
  return clienteApi<RespuestaPaginada<Profesional>>('/profesionales', { parametros: filtros })
}

export function crearProfesional(payload: CrearProfesionalPayload) {
  return clienteApi<Profesional>('/profesionales', { metodo: 'POST', cuerpo: payload })
}

export function actualizarProfesional(id: string, payload: ActualizarProfesionalPayload) {
  return clienteApi<Profesional>(`/profesionales/${id}`, { metodo: 'PATCH', cuerpo: payload })
}

export function actualizarEstadoProfesional(id: string, payload: ActualizarEstadoProfesionalPayload) {
  return clienteApi<Profesional>(`/profesionales/${id}/estado`, { metodo: 'PATCH', cuerpo: payload })
}
