import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { EstadoReserva } from '../../../reservas/dominio/entidades/estado-reserva';
import {
  FilaMatrizReporteReservas,
  ResumenReporteReservas,
} from '../../dominio/modelos/reporte-reservas';
import { descripcionFiltrosAplicados, etiquetaEstadoReserva } from '../../dominio/servicios/etiquetas-reporte';

export function neutralizarExcel(texto: string): string {
  return /^[=+\-@]/.test(texto) ? `'${texto}` : texto;
}

const ANCHO_ESTADO = 24;
const ANCHO_DIMENSION = 16;

@Injectable()
export class ExcelReporteReservasGenerador {
  async generar(resumen: ResumenReporteReservas): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const hoja = workbook.addWorksheet('Resumen');

    const columnasTotales = Math.max(
      resumen.matrices.porProfesional.length,
      resumen.matrices.porEspecialidad.length,
    ) + 2;
    hoja.columns = [ANCHO_ESTADO, ...Array(columnasTotales - 1).fill(ANCHO_DIMENSION)];

    hoja.addRow([neutralizarExcel('Reporte de reservas')]).font = { bold: true, size: 16 };
    hoja.addRow([
      neutralizarExcel(
        `Período: ${resumen.periodo.desde} a ${resumen.periodo.hasta} (${resumen.periodo.zona}) · Modo: ${resumen.periodo.modo}`,
      ),
    ]);
    hoja.addRow([neutralizarExcel(`Filtros: ${descripcionFiltrosAplicados(resumen)}`)]);
    hoja.addRow([neutralizarExcel(`Generado: ${resumen.generadoEn}`)]);
    hoja.addRow([neutralizarExcel('Total de citas'), resumen.total]);
    hoja.addRow([neutralizarExcel('Concretadas (ATENDIDA)'), resumen.concretadas]);
    hoja.addRow([]);

    this.escribirMatriz(hoja, 'Matriz Estado × Profesional', resumen.matrices.porProfesional);
    hoja.addRow([]);
    this.escribirMatriz(hoja, 'Matriz Estado × Especialidad', resumen.matrices.porEspecialidad);
    hoja.addRow([]);

    this.escribirTabla(hoja, 'Desglose por estado', ['Estado', 'Cantidad'], (agregar) => {
      for (const fila of resumen.porEstado) {
        agregar([neutralizarExcel(etiquetaEstadoReserva(fila.estado)), fila.cantidad]);
      }
    });

    this.escribirTabla(hoja, 'Desglose por profesional', ['Profesional', 'Cantidad'], (agregar) => {
      for (const fila of resumen.porProfesional) {
        agregar([neutralizarExcel(fila.nombre), fila.cantidad]);
      }
    });

    this.escribirTabla(hoja, 'Desglose por especialidad', ['Especialidad', 'Cantidad'], (agregar) => {
      for (const fila of resumen.porEspecialidad) {
        agregar([neutralizarExcel(fila.nombre), fila.cantidad]);
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private escribirMatriz(
    hoja: ExcelJS.Worksheet,
    titulo: string,
    filasColumnas: FilaMatrizReporteReservas[],
  ): void {
    const estados = Object.values(EstadoReserva);
    const totalGeneral = filasColumnas.reduce((acumulado, fila) => acumulado + fila.total, 0);

    hoja.addRow([neutralizarExcel(titulo)]).font = { bold: true, size: 12 };
    const encabezados: Array<string | number> = [
      neutralizarExcel('Estado'),
      ...filasColumnas.map((fila) => neutralizarExcel(fila.columnaNombre)),
      neutralizarExcel('TOTAL'),
    ];
    hoja.addRow(encabezados).font = { bold: true };

    for (const estado of estados) {
      const totalEstado = filasColumnas.reduce(
        (acumulado, fila) => acumulado + this.cantidadDe(fila, estado),
        0,
      );
      const celdas: Array<string | number> = [
        neutralizarExcel(etiquetaEstadoReserva(estado)),
        ...filasColumnas.map((fila) => this.cantidadDe(fila, estado)),
        totalEstado,
      ];
      hoja.addRow(celdas);
    }

    const filaTotales: Array<string | number> = [
      neutralizarExcel('TOTAL'),
      ...filasColumnas.map((fila) => fila.total),
      totalGeneral,
    ];
    hoja.addRow(filaTotales).font = { bold: true };
  }

  private cantidadDe(fila: FilaMatrizReporteReservas, estado: EstadoReserva): number {
    return fila.celdas.find((celda) => celda.estado === estado)?.cantidad ?? 0;
  }

  private escribirTabla(
    hoja: ExcelJS.Worksheet,
    titulo: string,
    columnas: string[],
    escribirFilas: (agregar: (fila: Array<string | number>) => void) => void,
  ): void {
    hoja.addRow([neutralizarExcel(titulo)]).font = { bold: true, size: 12 };
    hoja.addRow(columnas.map((columna) => neutralizarExcel(columna))).font = { bold: true };
    escribirFilas((fila) => hoja.addRow(fila));
  }
}