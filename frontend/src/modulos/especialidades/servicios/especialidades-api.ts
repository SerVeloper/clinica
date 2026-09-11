import { clienteApi } from '../../../compartido/api/cliente-api'
import type { FiltrosPaginacion, RespuestaPaginada } from '../../../compartido/tipos/paginacion'
import type { Especialidad } from '../tipos/especialidad'

const LIMITE_LISTA_COMPLETA = 100

export interface CrearEspecialidadPayload {
  nombre: string
  duracionMinutos: 15 | 30 | 60
}

export type ActualizarEspecialidadPayload = CrearEspecialidadPayload

export interface ActualizarEstadoEspecialidadPayload {
  activo: boolean
}

export interface FiltrosEspecialidades extends FiltrosPaginacion {
  activo?: string
}

export function listarEspecialidades() {
  return listarEspecialidadesPaginado({ limite: LIMITE_LISTA_COMPLETA }).then((respuesta) => respuesta.datos)
}

export function listarEspecialidadesPaginado(filtros: FiltrosEspecialidades = {}) {
  return clienteApi<RespuestaPaginada<Especialidad>>('/especialidades', { parametros: filtros })
}

export function crearEspecialidad(payload: CrearEspecialidadPayload) {
  return clienteApi<Especialidad>('/especialidades', { metodo: 'POST', cuerpo: payload })
}

export function actualizarEspecialidad(id: string, payload: ActualizarEspecialidadPayload) {
  return clienteApi<Especialidad>(`/especialidades/${id}`, { metodo: 'PATCH', cuerpo: payload })
}

export function actualizarEstadoEspecialidad(id: string, payload: ActualizarEstadoEspecialidadPayload) {
  return clienteApi<Especialidad>(`/especialidades/${id}/estado`, { metodo: 'PATCH', cuerpo: payload })
}
