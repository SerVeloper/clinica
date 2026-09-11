import { clienteApi } from '../../../compartido/api/cliente-api'
import type { FiltrosPaginacion, RespuestaPaginada } from '../../../compartido/tipos/paginacion'
import type { ActualizarEstadoPacientePayload, ActualizarPacientePayload, CrearPacientePayload, Paciente } from '../tipos/paciente'

const LIMITE_LISTA_COMPLETA = 100

export interface FiltrosPacientes extends FiltrosPaginacion {
  activo?: string
}

export function listarPacientes() {
  return listarPacientesPaginado({ limite: LIMITE_LISTA_COMPLETA }).then((respuesta) => respuesta.datos)
}

export function listarPacientesPaginado(filtros: FiltrosPacientes = {}) {
  return clienteApi<RespuestaPaginada<Paciente>>('/pacientes', { parametros: filtros })
}

export function crearPaciente(payload: CrearPacientePayload) {
  return clienteApi<Paciente>('/pacientes', { metodo: 'POST', cuerpo: payload })
}

export function actualizarPaciente(id: string, payload: ActualizarPacientePayload) {
  return clienteApi<Paciente>(`/pacientes/${id}`, { metodo: 'PATCH', cuerpo: payload })
}

export function actualizarEstadoPaciente(id: string, payload: ActualizarEstadoPacientePayload) {
  return clienteApi<Paciente>(`/pacientes/${id}/estado`, { metodo: 'PATCH', cuerpo: payload })
}
