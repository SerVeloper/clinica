import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { EstadoReserva } from '../../../reservas/dominio/entidades/estado-reserva';
import {
  FilaMatrizReporteReservas,
  ResumenReporteReservas,
} from '../../dominio/modelos/reporte-reservas';
import { descripcionFiltrosAplicados, etiquetaEstadoReserva } from '../../dominio/servicios/etiquetas-reporte';

const MARGEN = 40;
const ALTO_TITULO = 30;
const ANCHO_ESTADO = 110;
const ANCHO_TOTAL = 60;
const ANCHO_COLUMNA_MINIMO = 40;
const altoFinalContenido = (doc: PDFKit.PDFDocument): number => doc.page.height - 60;

@Injectable()
export class PdfReporteReservasGenerador {
  async generar(resumen: ResumenReporteReservas): Promise<Buffer> {
    return new Promise((resolver, rechazar) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: MARGEN, bufferPages: true });
        doc.info.Title = 'Reporte de reservas';

        const trozos: Buffer[] = [];
        doc.on('data', (trozosPush: Buffer) => trozos.push(trozosPush));
        doc.on('end', () => resolver(Buffer.concat(trozos)));
        doc.on('error', rechazar);

        this.dibujarContenido(doc, resumen);
        this.numerarPaginas(doc);
        doc.end();
      } catch (error) {
        rechazar(error as Error);
      }
    });
  }

  private dibujarContenido(doc: PDFKit.PDFDocument, resumen: ResumenReporteReservas): void {
    this.encabezadoPagina(doc, resumen);

    this.escribirMatriz(doc, resumen, 'Matriz Estado × Profesional', resumen.matrices.porProfesional);
    doc.moveDown(0.8);
    this.escribirMatriz(doc, resumen, 'Matriz Estado × Especialidad', resumen.matrices.porEspecialidad);
  }

  private encabezadoPagina(doc: PDFKit.PDFDocument, resumen: ResumenReporteReservas): void {
    doc.font('Helvetica-Bold').fontSize(15).text('Reporte de reservas', MARGEN, MARGEN);
    doc.font('Helvetica').fontSize(9);
    doc.text(
      `Período: ${resumen.periodo.desde} a ${resumen.periodo.hasta} (${resumen.periodo.zona}) · Modo: ${resumen.periodo.modo}`,
    );
    doc.text(`Filtros: ${descripcionFiltrosAplicados(resumen)}`);
    doc.text(`Total: ${resumen.total} · Concretadas (ATENDIDA): ${resumen.concretadas}`);
    doc.text(`Generado: ${resumen.generadoEn}`);
    doc.moveDown(0.5);
  }

  private escribirMatriz(
    doc: PDFKit.PDFDocument,
    resumen: ResumenReporteReservas,
    titulo: string,
    columnas: FilaMatrizReporteReservas[],
  ): void {
    const estados = Object.values(EstadoReserva);
    const anchoUtil = doc.page.width - MARGEN * 2;
    const espacioDimensiones = Math.max(anchoUtil - ANCHO_ESTADO - ANCHO_TOTAL, 0);
    const anchoColumna =
      columnas.length > 0
        ? Math.max(ANCHO_COLUMNA_MINIMO, Math.floor(espacioDimensiones / columnas.length))
        : ANCHO_COLUMNA_MINIMO;

    this.asegurarEspacio(doc, resumen, ALTO_TITULO);
    doc.font('Helvetica-Bold').fontSize(11).text(titulo);
    doc.moveDown(0.3);

    this.dibujarFilaMatriz(doc, resumen, ['Estado', ...columnas.map((c) => c.columnaNombre), 'TOTAL'], anchoColumna, true);

    for (const estado of estados) {
      const totalEstado = columnas.reduce(
        (acumulado, fila) => acumulado + this.cantidadDe(fila, estado),
        0,
      );
      const celdas = [
        etiquetaEstadoReserva(estado),
        ...columnas.map((fila) => String(this.cantidadDe(fila, estado))),
        String(totalEstado),
      ];
      this.dibujarFilaMatriz(doc, resumen, celdas, anchoColumna, false);
    }

    const totalGeneral = columnas.reduce((acumulado, fila) => acumulado + fila.total, 0);
    const filaTotales = ['TOTAL', ...columnas.map((fila) => String(fila.total)), String(totalGeneral)];
    this.dibujarFilaMatriz(doc, resumen, filaTotales, anchoColumna, false, true);
  }

  private cantidadDe(fila: FilaMatrizReporteReservas, estado: EstadoReserva): number {
    return fila.celdas.find((celda) => celda.estado === estado)?.cantidad ?? 0;
  }

  private dibujarFilaMatriz(
    doc: PDFKit.PDFDocument,
    resumen: ResumenReporteReservas,
    celdas: string[],
    anchoColumna: number,
    esEncabezado: boolean,
    esTotal = false,
  ): void {
    const anchos = [ANCHO_ESTADO, ...Array(celdas.length - 2).fill(anchoColumna), ANCHO_TOTAL];
    const items = celdas.map((celda, indice) => ({
      texto: celda,
      ancho: anchos[indice] ?? ANCHO_COLUMNA_MINIMO,
    }));

    const altoFila = Math.max(
      ...items.map((item) =>
        doc.font(esEncabezado || esTotal ? 'Helvetica-Bold' : 'Helvetica').fontSize(10).heightOfString(item.texto, {
          width: item.ancho,
          lineBreak: true,
        }),
      ),
      13,
    );

    this.asegurarEspacio(doc, resumen, altoFila + 6);

    const y = doc.y;
    let x = MARGEN;
    doc.font(esEncabezado || esTotal ? 'Helvetica-Bold' : 'Helvetica').fontSize(10);
    for (let indice = 0; indice < items.length; indice += 1) {
      const item = items[indice];
      const esPrimera = indice === 0;
      const esUltima = indice === items.length - 1;
      doc.text(item.texto, x, y, {
        width: item.ancho,
        lineBreak: true,
        align: esPrimera ? 'left' : esUltima ? 'right' : 'center',
      });
      x += item.ancho;
    }

    doc.y = y + altoFila + 6;
  }

  private asegurarEspacio(doc: PDFKit.PDFDocument, resumen: ResumenReporteReservas, alto: number): void {
    if (doc.y + alto > altoFinalContenido(doc)) {
      doc.addPage();
      this.encabezadoPagina(doc, resumen);
    }
  }

  private numerarPaginas(doc: PDFKit.PDFDocument): void {
    const rango = doc.bufferedPageRange();
    for (let indice = rango.start; indice < rango.start + rango.count; indice += 1) {
      doc.switchToPage(indice);
      doc.font('Helvetica').fontSize(8);
      doc.text(`Página ${indice + 1} de ${rango.count}`, MARGEN, doc.page.height - 35, {
        width: doc.page.width - MARGEN * 2,
        align: 'center',
        lineBreak: false,
      });
    }
  }
}