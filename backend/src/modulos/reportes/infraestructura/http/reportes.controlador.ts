import { Get, Controller, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiProduces, ApiTags } from '@nestjs/swagger';
import { mapearError } from '../../../../compartido/infraestructura/filtros/mapear-error';
import { UsuarioActual } from '../../../../compartido/infraestructura/decorators/usuario-actual.decorator';
import { Roles } from '../../../../compartido/infraestructura/decorators/roles.decorator';
import { UsuarioAutenticado } from '../../../usuarios/aplicacion/servicios/auth.servicio';
import { ConsultarReporteReservasCasoUso } from '../../aplicacion/casos-uso/consultar-reporte-reservas.caso-uso';
import { ConsultarEspecialidadesProfesionalCasoUso } from '../../aplicacion/casos-uso/consultar-especialidades-profesional.caso-uso';
import { ExportarReporteReservasCasoUso, FormatoExportacionReporte } from '../../aplicacion/casos-uso/exportar-reporte-reservas.caso-uso';
import { ConsultarReporteReservasDto } from '../../aplicacion/dtos/consultar-reporte-reservas.dto';

const TIPO_EXCEL = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

interface RespuestaDescarga {
  setHeader(nombre: string, valor: string): void;
  send(contenido: Buffer): void;
}

@ApiTags('Reportes')
@Controller('reportes/reservas')
export class ReportesControlador {
  constructor(
    private readonly consultarResumen: ConsultarReporteReservasCasoUso,
    private readonly exportarReporte: ExportarReporteReservasCasoUso,
    private readonly consultarEspecialidadesProfesional: ConsultarEspecialidadesProfesionalCasoUso,
  ) {}

  @Get('especialidades-profesional')
  @Roles('ESPECIALISTA')
  @ApiOkResponse({ description: 'Especialidades de las citas del profesional autenticado' })
  async especialidadesDelProfesional(@UsuarioActual() usuario: UsuarioAutenticado) {
    try {
      return await this.consultarEspecialidadesProfesional.ejecutar(usuario);
    } catch (error) {
      mapearError(error);
    }
  }

  @Get('resumen')
  @Roles('ADMIN', 'ESPECIALISTA')
  @ApiOkResponse({ description: 'Resumen de conteos de citas para el período y filtros indicados' })
  async resumen(@UsuarioActual() usuario: UsuarioAutenticado, @Query() dto: ConsultarReporteReservasDto) {
    try {
      return await this.consultarResumen.ejecutar(dto, usuario);
    } catch (error) {
      mapearError(error);
    }
  }

  @Get('exportaciones/excel')
  @Roles('ADMIN', 'ESPECIALISTA')
  @ApiProduces(TIPO_EXCEL)
  async exportarExcel(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Query() dto: ConsultarReporteReservasDto,
    @Res() respuesta: RespuestaDescarga,
  ) {
    await this.enviarArchivo(usuario, dto, 'excel', TIPO_EXCEL, respuesta);
  }

  @Get('exportaciones/pdf')
  @Roles('ADMIN', 'ESPECIALISTA')
  @ApiProduces('application/pdf')
  async exportarPdf(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Query() dto: ConsultarReporteReservasDto,
    @Res() respuesta: RespuestaDescarga,
  ) {
    await this.enviarArchivo(usuario, dto, 'pdf', 'application/pdf', respuesta);
  }

  private async enviarArchivo(
    usuario: UsuarioAutenticado,
    dto: ConsultarReporteReservasDto,
    formato: FormatoExportacionReporte,
    tipoContenido: string,
    respuesta: RespuestaDescarga,
  ): Promise<void> {
    try {
      const { archivo, nombreArchivo } = await this.exportarReporte.ejecutar(dto, usuario, formato);
      respuesta.setHeader('Content-Type', tipoContenido);
      respuesta.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
      respuesta.setHeader('Cache-Control', 'no-store');
      respuesta.send(archivo);
    } catch (error) {
      mapearError(error);
    }
  }
}