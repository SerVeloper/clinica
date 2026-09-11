import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActualizarEspecialidadCasoUso } from './aplicacion/casos-uso/actualizar-especialidad.caso-uso';
import { ActualizarEstadoEspecialidadCasoUso } from './aplicacion/casos-uso/actualizar-estado-especialidad.caso-uso';
import { CrearEspecialidadCasoUso } from './aplicacion/casos-uso/crear-especialidad.caso-uso';
import { ListarEspecialidadesCasoUso } from './aplicacion/casos-uso/listar-especialidades.caso-uso';
import { REPOSITORIO_ESPECIALIDADES } from './dominio/repositorios/repositorio-especialidades';
import { EspecialidadesControlador } from './infraestructura/http/especialidades.controlador';
import { EspecialidadOrmEntidad } from './infraestructura/persistencia/typeorm/especialidad.orm-entidad';
import { RepositorioEspecialidadesTypeOrm } from './infraestructura/persistencia/typeorm/repositorio-especialidades.typeorm';
import { SembrarEspecialidadesServicio } from './infraestructura/semillas/sembrar-especialidades.servicio';

@Module({
  imports: [TypeOrmModule.forFeature([EspecialidadOrmEntidad])],
  controllers: [EspecialidadesControlador],
  providers: [
    CrearEspecialidadCasoUso,
    ActualizarEspecialidadCasoUso,
    ActualizarEstadoEspecialidadCasoUso,
    ListarEspecialidadesCasoUso,
    SembrarEspecialidadesServicio,
    { provide: REPOSITORIO_ESPECIALIDADES, useClass: RepositorioEspecialidadesTypeOrm },
  ],
  exports: [REPOSITORIO_ESPECIALIDADES],
})
export class EspecialidadesModule {}
