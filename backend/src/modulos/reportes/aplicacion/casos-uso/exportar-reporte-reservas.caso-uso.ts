import { Injectable } from '@nestjs/common';
import { UsuarioAutenticado } from '../../../usuarios/aplicacion/servicios/auth.servicio';
import { ConsultarReporteReservasDto } from '../dtos/consultar-reporte-reservas.dto';
import { ConsultarReporteReservasCasoUso } from './consultar-reporte-reservas.caso-uso';
import { ExcelReporteReservasGenerador } from '../../infraestructura/exportacion/excel-reporte-reservas.generador';
import { PdfReporteReservasGenerador } from '../../infraestructura/exportacion/pdf-reporte-reservas.generador';

export type FormatoExportacionReporte = 'excel' | 'pdf';

export interface ResultadoExportacionReporte {
  archivo: Buffer;
  nombreArchivo: string;
}

@Injectable()
export class ExportarReporteReservasCasoUso {
  constructor(
    private readonly consultarResumen: ConsultarReporteReservasCasoUso,
    private readonly excel: ExcelReporteReservasGenerador,
    private readonly pdf: PdfReporteReservasGenerador,
  ) {}

  async ejecutar(
    dto: ConsultarReporteReservasDto,
    usuario: UsuarioAutenticado,
    formato: FormatoExportacionReporte,
  ): Promise<ResultadoExportacionReporte> {
    const resumen = await this.consultarResumen.ejecutar(dto, usuario);
    const archivo =
      formato === 'excel' ? await this.excel.generar(resumen) : await this.pdf.generar(resumen);
    const extension = formato === 'excel' ? 'xlsx' : 'pdf';
    const nombreArchivo = `reporte-reservas-${resumen.periodo.desde}-${resumen.periodo.hasta}.${extension}`;
    return { archivo, nombreArchivo };
  }
}