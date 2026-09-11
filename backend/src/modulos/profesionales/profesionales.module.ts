import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EspecialidadesModule } from '../especialidades/especialidades.module';
import { ActualizarProfesionalCasoUso } from './aplicacion/casos-uso/actualizar-profesional.caso-uso';
import { ActualizarEstadoProfesionalCasoUso } from './aplicacion/casos-uso/actualizar-estado-profesional.caso-uso';
import { CrearProfesionalCasoUso } from './aplicacion/casos-uso/crear-profesional.caso-uso';
import { ListarProfesionalesCasoUso } from './aplicacion/casos-uso/listar-profesionales.caso-uso';
import { REPOSITORIO_PROFESIONALES } from './dominio/repositorios/repositorio-profesionales';
import { ProfesionalesControlador } from './infraestructura/http/profesionales.controlador';
import { ProfesionalOrmEntidad } from './infraestructura/persistencia/typeorm/profesional.orm-entidad';
import { RepositorioProfesionalesTypeOrm } from './infraestructura/persistencia/typeorm/repositorio-profesionales.typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ProfesionalOrmEntidad]), EspecialidadesModule],
  controllers: [ProfesionalesControlador],
  providers: [
    CrearProfesionalCasoUso,
    ActualizarProfesionalCasoUso,
    ActualizarEstadoProfesionalCasoUso,
    ListarProfesionalesCasoUso,
    { provide: REPOSITORIO_PROFESIONALES, useClass: RepositorioProfesionalesTypeOrm },
  ],
  exports: [REPOSITORIO_PROFESIONALES],
})
export class ProfesionalesModule {}
