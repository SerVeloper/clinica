export interface FiltrosPaginacion {
  pagina?: string | number;
  limite?: string | number;
}

export interface RespuestaPaginada<T> {
  datos: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface PaginacionNormalizada {
  pagina: number;
  limite: number;
  saltear: number;
}

const PAGINA_PREDETERMINADA = 1;
const LIMITE_PREDETERMINADO = 10;
const LIMITE_MAXIMO = 100;

export function normalizarPaginacion(filtros: FiltrosPaginacion = {}): PaginacionNormalizada {
  const pagina = Math.max(Number(filtros.pagina) || PAGINA_PREDETERMINADA, PAGINA_PREDETERMINADA);
  const limiteSolicitado = Math.max(Number(filtros.limite) || LIMITE_PREDETERMINADO, 1);
  const limite = Math.min(limiteSolicitado, LIMITE_MAXIMO);

  return {
    pagina,
    limite,
    saltear: (pagina - 1) * limite,
  };
}

export function crearRespuestaPaginada<T>(datos: T[], total: number, pagina: number, limite: number): RespuestaPaginada<T> {
  return {
    datos,
    total,
    pagina,
    limite,
    totalPaginas: Math.max(Math.ceil(total / limite), 1),
  };
}
