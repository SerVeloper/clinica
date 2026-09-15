import { descargarBlob, clienteApi } from '../../../compartido/api/cliente-api'
import { leerSesion } from '../../../compartido/api/almacenamiento-sesion'
import type { EspecialidadProfesionalReporte, FiltrosReporteReservas, FormatoReporteReservas, ResumenReporteReservas } from '../tipos/reporte-reservas'

const ALMACEN_TOKEN = 'clinica_token'

function parametrosConsulta(filtros: FiltrosReporteReservas): Record<string, string> {
  const parametros: Record<string, string> = { modo: filtros.modo }

  if (filtros.modo === 'FECHA') {
    if (filtros.fecha) parametros.fecha = filtros.fecha
  } else if (filtros.modo === 'MES') {
    if (filtros.mes) parametros.mes = filtros.mes
  } else {
    if (filtros.desde) parametros.desde = filtros.desde
    if (filtros.hasta) parametros.hasta = filtros.hasta
  }

  if (filtros.estado) parametros.estado = filtros.estado
  if (filtros.profesionalId) parametros.profesionalId = filtros.profesionalId
  if (filtros.especialidadId) parametros.especialidadId = filtros.especialidadId

  return parametros
}

export function consultarResumen(filtros: FiltrosReporteReservas) {
  return clienteApi<ResumenReporteReservas>('/reportes/reservas/resumen', {
    parametros: parametrosConsulta(filtros),
  })
}

export function consultarEspecialidadesDeProfesional() {
  return clienteApi<EspecialidadProfesionalReporte[]>('/reportes/reservas/especialidades-profesional')
}

export async function descargarReporte(filtros: FiltrosReporteReservas, formato: FormatoReporteReservas): Promise<Blob> {
  const token = leerSesion(ALMACEN_TOKEN) ?? ''
  return descargarBlob(`/reportes/reservas/exportaciones/${formato}`, parametrosConsulta(filtros), token)
}