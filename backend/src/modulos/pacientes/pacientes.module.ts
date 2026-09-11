import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActualizarPacienteCasoUso } from './aplicacion/casos-uso/actualizar-paciente.caso-uso';
import { ActualizarEstadoPacienteCasoUso } from './aplicacion/casos-uso/actualizar-estado-paciente.caso-uso';
import { CrearPacienteCasoUso } from './aplicacion/casos-uso/crear-paciente.caso-uso';
import { ListarPacientesCasoUso } from './aplicacion/casos-uso/listar-pacientes.caso-uso';
import { REPOSITORIO_PACIENTES } from './dominio/repositorios/repositorio-pacientes';
import { PacientesControlador } from './infraestructura/http/pacientes.controlador';
import { PacienteOrmEntidad } from './infraestructura/persistencia/typeorm/paciente.orm-entidad';
import { RepositorioPacientesTypeOrm } from './infraestructura/persistencia/typeorm/repositorio-pacientes.typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([PacienteOrmEntidad])],
  controllers: [PacientesControlador],
  providers: [
    CrearPacienteCasoUso,
    ActualizarPacienteCasoUso,
    ActualizarEstadoPacienteCasoUso,
    ListarPacientesCasoUso,
    { provide: REPOSITORIO_PACIENTES, useClass: RepositorioPacientesTypeOrm },
  ],
  exports: [REPOSITORIO_PACIENTES],
})
export class PacientesModule {}
