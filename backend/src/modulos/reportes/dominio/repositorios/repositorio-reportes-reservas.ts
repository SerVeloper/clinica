import type {
  ConsultaReporteReservas,
  EspecialidadProfesionalReporte,
  FilaAgregadoReporteReservas,
} from '../modelos/reporte-reservas';

export const REPOSITORIO_REPORTES_RESERVAS = Symbol('REPOSITORIO_REPORTES_RESERVAS');

export interface RepositorioReportesReservas {
  agregar(consulta: ConsultaReporteReservas): Promise<FilaAgregadoReporteReservas[]>;
  listarEspecialidadesDeProfesional(profesionalId: string): Promise<EspecialidadProfesionalReporte[]>;
}