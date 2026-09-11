export interface RespuestaPaginada<T> {
  datos: T[]
  total: number
  pagina: number
  limite: number
  totalPaginas: number
}

export interface FiltrosPaginacion {
  buscar?: string
  pagina?: number
  limite?: number
}
