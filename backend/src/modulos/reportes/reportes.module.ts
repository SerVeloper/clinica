import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EspecialidadOrmEntidad } from '../especialidades/infraestructura/persistencia/typeorm/especialidad.orm-entidad';
import { ProfesionalOrmEntidad } from '../profesionales/infraestructura/persistencia/typeorm/profesional.orm-entidad';
import { ReservaOrmEntidad } from '../reservas/infraestructura/persistencia/typeorm/reserva.orm-entidad';
import { ConsultarReporteReservasCasoUso } from './aplicacion/casos-uso/consultar-reporte-reservas.caso-uso';
import { ConsultarEspecialidadesProfesionalCasoUso } from './aplicacion/casos-uso/consultar-especialidades-profesional.caso-uso';
import { ExportarReporteReservasCasoUso } from './aplicacion/casos-uso/exportar-reporte-reservas.caso-uso';
import { REPOSITORIO_REPORTES_RESERVAS } from './dominio/repositorios/repositorio-reportes-reservas';
import { ExcelReporteReservasGenerador } from './infraestructura/exportacion/excel-reporte-reservas.generador';
import { PdfReporteReservasGenerador } from './infraestructura/exportacion/pdf-reporte-reservas.generador';
import { ReportesControlador } from './infraestructura/http/reportes.controlador';
import { RepositorioReportesReservasTypeOrm } from './infraestructura/persistencia/typeorm/repositorio-reportes-reservas.typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReservaOrmEntidad,
      ProfesionalOrmEntidad,
      EspecialidadOrmEntidad,
    ]),
  ],
  controllers: [ReportesControlador],
  providers: [
    ConsultarReporteReservasCasoUso,
    ConsultarEspecialidadesProfesionalCasoUso,
    ExportarReporteReservasCasoUso,
    ExcelReporteReservasGenerador,
    PdfReporteReservasGenerador,
    { provide: REPOSITORIO_REPORTES_RESERVAS, useClass: RepositorioReportesReservasTypeOrm },
  ],
})
export class ReportesModule {}