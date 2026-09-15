import { EstadoReserva } from '../../../reservas/dominio/entidades/estado-reserva';

export type ModoPeriodoReporte = 'FECHA' | 'MES' | 'RANGO';

export interface ConsultaReporteReservas {
  desde: Date;
  hasta: Date;
  estado?: EstadoReserva;
  profesionalId?: string;
  especialidadId?: string;
  alcanceProfesionalId?: string | null;
}

export interface FilaAgregadoReporteReservas {
  estado: EstadoReserva;
  profesionalId: string | null;
  profesionalApellido: string | null;
  profesionalNombre: string | null;
  especialidadId: string | null;
  especialidadNombre: string | null;
  cantidad: number;
}

export interface DesgloseReporteReservas {
  id: string | null;
  nombre: string;
  cantidad: number;
}

export interface FilaMatrizReporteReservas {
  columnaId: string | null;
  columnaNombre: string;
  celdas: Array<{ estado: EstadoReserva; cantidad: number }>;
  total: number;
}

export interface EspecialidadProfesionalReporte {
  id: string;
  nombre: string;
}

export interface FiltrosAplicadosReporteReservas {
  estado?: EstadoReserva;
  profesionalId?: string;
  especialidadId?: string;
}

export interface ResumenReporteReservas {
  periodo: {
    modo: ModoPeriodoReporte;
    desde: string;
    hasta: string;
    zona: 'UTC';
  };
  filtrosAplicados: FiltrosAplicadosReporteReservas;
  generadoEn: string;
  total: number;
  concretadas: number;
  porEstado: Array<{ estado: EstadoReserva; cantidad: number }>;
  porProfesional: DesgloseReporteReservas[];
  porEspecialidad: DesgloseReporteReservas[];
  matrices: {
    porProfesional: FilaMatrizReporteReservas[];
    porEspecialidad: FilaMatrizReporteReservas[];
  };
}