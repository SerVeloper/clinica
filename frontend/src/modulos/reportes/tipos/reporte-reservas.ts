export type ModoPeriodoReporte = 'FECHA' | 'MES' | 'RANGO'

export type EstadoReservaReporte = 'PENDIENTE' | 'CONFIRMADA' | 'ATENDIDA' | 'NO_ASISTIO' | 'CANCELADA'

export interface FiltrosReporteReservas {
  modo: ModoPeriodoReporte
  fecha: string
  mes: string
  desde: string
  hasta: string
  estado: string
  profesionalId: string
  especialidadId: string
}

export interface DesgloseReporteReservas {
  id: string | null
  nombre: string
  cantidad: number
}

export interface FilaMatrizReporteReservas {
  columnaId: string | null
  columnaNombre: string
  celdas: Array<{ estado: EstadoReservaReporte; cantidad: number }>
  total: number
}

export interface EspecialidadProfesionalReporte {
  id: string
  nombre: string
}

export interface FiltrosAplicadosReporte {
  estado?: EstadoReservaReporte
  profesionalId?: string
  especialidadId?: string
}

export interface ResumenReporteReservas {
  periodo: {
    modo: ModoPeriodoReporte
    desde: string
    hasta: string
    zona: 'UTC'
  }
  filtrosAplicados: FiltrosAplicadosReporte
  generadoEn: string
  total: number
  concretadas: number
  porEstado: Array<{ estado: EstadoReservaReporte; cantidad: number }>
  porProfesional: DesgloseReporteReservas[]
  porEspecialidad: DesgloseReporteReservas[]
  matrices: {
    porProfesional: FilaMatrizReporteReservas[]
    porEspecialidad: FilaMatrizReporteReservas[]
  }
}

export type FormatoReporteReservas = 'excel' | 'pdf'