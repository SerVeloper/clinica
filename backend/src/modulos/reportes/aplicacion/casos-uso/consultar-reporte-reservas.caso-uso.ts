import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { UsuarioAutenticado } from '../../../usuarios/aplicacion/servicios/auth.servicio';
import { EstadoReserva } from '../../../reservas/dominio/entidades/estado-reserva';
import { ConsultarReporteReservasDto } from '../dtos/consultar-reporte-reservas.dto';
import {
  DesgloseReporteReservas,
  FilaAgregadoReporteReservas,
  FilaMatrizReporteReservas,
  ModoPeriodoReporte,
  ResumenReporteReservas,
} from '../../dominio/modelos/reporte-reservas';
import {
  REPOSITORIO_REPORTES_RESERVAS,
  RepositorioReportesReservas,
} from '../../dominio/repositorios/repositorio-reportes-reservas';
import { calcularLimitesPeriodo } from '../../dominio/servicios/calcular-limites-periodo';

const ETIQUETA_PROFESIONAL_NO_DISPONIBLE = 'Profesional no disponible';
const ETIQUETA_ESPECIALIDAD_NO_DISPONIBLE = 'Especialidad no disponible';

function resolverAlcanceProfesional(usuario: UsuarioAutenticado, filtroProfesionalId?: string): string | null {
  if (usuario.rol === 'ADMIN') return null;

  const vinculado = usuario.profesionalId;
  if (!vinculado) {
    throw new ForbiddenException('El especialista no tiene un profesional vinculado para consultar reportes');
  }
  if (filtroProfesionalId && filtroProfesionalId !== vinculado) {
    throw new ForbiddenException('No puede consultar reportes de otro profesional');
  }
  return vinculado;
}

function fechaIsoUtc(fecha: Date): string {
  const anio = fecha.getUTCFullYear();
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getUTCDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function agruparPorProfesional(filas: FilaAgregadoReporteReservas[]): DesgloseReporteReservas[] {
  const porId = new Map<string, DesgloseReporteReservas>();
  for (const fila of filas) {
    const id = fila.profesionalId ?? null;
    const clave = id ?? 'no-disponible';
    const nombre =
      id === null
        ? ETIQUETA_PROFESIONAL_NO_DISPONIBLE
        : `${fila.profesionalApellido ?? ''} ${fila.profesionalNombre ?? ''}`.trim() ||
          ETIQUETA_PROFESIONAL_NO_DISPONIBLE;
    const existente = porId.get(clave);
    if (existente) existente.cantidad += fila.cantidad;
    else porId.set(clave, { id, nombre, cantidad: fila.cantidad });
  }
  return ordenarPorCantidadYNombre(porId);
}

function agruparPorEspecialidad(filas: FilaAgregadoReporteReservas[]): DesgloseReporteReservas[] {
  const porId = new Map<string, DesgloseReporteReservas>();
  for (const fila of filas) {
    const id = fila.especialidadId ?? null;
    const clave = id ?? 'no-disponible';
    const nombre =
      id === null
        ? ETIQUETA_ESPECIALIDAD_NO_DISPONIBLE
        : fila.especialidadNombre?.trim() || ETIQUETA_ESPECIALIDAD_NO_DISPONIBLE;
    const existente = porId.get(clave);
    if (existente) existente.cantidad += fila.cantidad;
    else porId.set(clave, { id, nombre, cantidad: fila.cantidad });
  }
  return ordenarPorCantidadYNombre(porId);
}

function ordenarPorCantidadYNombre(agrupado: Map<string, DesgloseReporteReservas>): DesgloseReporteReservas[] {
  return [...agrupado.values()].sort(
    (a, b) => b.cantidad - a.cantidad || a.nombre.localeCompare(b.nombre, 'es'),
  );
}

interface ColumnaMatriz {
  id: string;
  nombre: string;
}

function nombreColumnaProfesional(fila: FilaAgregadoReporteReservas): string {
  return fila.profesionalId === null
    ? ETIQUETA_PROFESIONAL_NO_DISPONIBLE
    : `${fila.profesionalApellido ?? ''} ${fila.profesionalNombre ?? ''}`.trim() ||
      ETIQUETA_PROFESIONAL_NO_DISPONIBLE;
}

function nombreColumnaEspecialidad(fila: FilaAgregadoReporteReservas): string {
  return fila.especialidadId === null
    ? ETIQUETA_ESPECIALIDAD_NO_DISPONIBLE
    : fila.especialidadNombre?.trim() || ETIQUETA_ESPECIALIDAD_NO_DISPONIBLE;
}

function construirMatriz(
  filas: FilaAgregadoReporteReservas[],
  resolverColumna: (fila: FilaAgregadoReporteReservas) => ColumnaMatriz,
): FilaMatrizReporteReservas[] {
  const ordenEstados = Object.values(EstadoReserva);
  const porColumna = new Map<string, FilaMatrizReporteReservas>();

  for (const fila of filas) {
    const { id, nombre } = resolverColumna(fila);
    let columna = porColumna.get(id);
    if (!columna) {
      columna = {
        columnaId: id === 'no-disponible' ? null : id,
        columnaNombre: nombre,
        celdas: ordenEstados.map((estado) => ({ estado, cantidad: 0 })),
        total: 0,
      };
      porColumna.set(id, columna);
    }
    const celda = columna.celdas.find((item) => item.estado === fila.estado);
    if (celda) celda.cantidad += fila.cantidad;
    columna.total += fila.cantidad;
  }

  return [...porColumna.values()].sort(
    (a, b) => b.total - a.total || a.columnaNombre.localeCompare(b.columnaNombre, 'es'),
  );
}

function contar(filas: FilaAgregadoReporteReservas[], estado: EstadoReserva): number {
  return filas
    .filter((fila) => fila.estado === estado)
    .reduce((acumulado, fila) => acumulado + fila.cantidad, 0);
}

function armarResumen(
  modo: ModoPeriodoReporte,
  desde: Date,
  hasta: Date,
  dto: ConsultarReporteReservasDto,
  filas: FilaAgregadoReporteReservas[],
): ResumenReporteReservas {
  const estadosCanonicos = Object.values(EstadoReserva);
  const filtrosAplicados: ResumenReporteReservas['filtrosAplicados'] = {};
  if (dto.estado) filtrosAplicados.estado = dto.estado;
  if (dto.profesionalId) filtrosAplicados.profesionalId = dto.profesionalId;
  if (dto.especialidadId) filtrosAplicados.especialidadId = dto.especialidadId;

  return {
    periodo: {
      modo,
      desde: fechaIsoUtc(desde),
      hasta: fechaIsoUtc(new Date(hasta.getTime() - 24 * 60 * 60 * 1000)),
      zona: 'UTC',
    },
    filtrosAplicados,
    generadoEn: new Date().toISOString(),
    total: filas.reduce((acumulado, fila) => acumulado + fila.cantidad, 0),
    concretadas: contar(filas, EstadoReserva.ATENDIDA),
    porEstado: estadosCanonicos.map((estado) => ({ estado, cantidad: contar(filas, estado) })),
    porProfesional: agruparPorProfesional(filas),
    porEspecialidad: agruparPorEspecialidad(filas),
    matrices: {
      porProfesional: construirMatriz(filas, (fila) => ({
        id: fila.profesionalId ?? 'no-disponible',
        nombre: nombreColumnaProfesional(fila),
      })),
      porEspecialidad: construirMatriz(filas, (fila) => ({
        id: fila.especialidadId ?? 'no-disponible',
        nombre: nombreColumnaEspecialidad(fila),
      })),
    },
  };
}

@Injectable()
export class ConsultarReporteReservasCasoUso {
  constructor(
    @Inject(REPOSITORIO_REPORTES_RESERVAS)
    private readonly repositorio: RepositorioReportesReservas,
  ) {}

  async ejecutar(
    dto: ConsultarReporteReservasDto,
    usuario: UsuarioAutenticado,
  ): Promise<ResumenReporteReservas> {
    const alcanceProfesionalId = resolverAlcanceProfesional(usuario, dto.profesionalId);
    const { desde, hasta } = calcularLimitesPeriodo(dto.modo, dto);

    const filas = await this.repositorio.agregar({
      desde,
      hasta,
      estado: dto.estado,
      profesionalId: dto.profesionalId,
      especialidadId: dto.especialidadId,
      alcanceProfesionalId,
    });

    return armarResumen(dto.modo!, desde, hasta, dto, filas);
  }
}