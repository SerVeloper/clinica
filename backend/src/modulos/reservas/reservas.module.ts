import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EspecialidadesModule } from '../especialidades/especialidades.module';
import { PacientesModule } from '../pacientes/pacientes.module';
import { ProfesionalesModule } from '../profesionales/profesionales.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { ActualizarEstadoReservaCasoUso } from './aplicacion/casos-uso/actualizar-estado-reserva.caso-uso';
import { CancelarReservaCasoUso } from './aplicacion/casos-uso/cancelar-reserva.caso-uso';
import { CrearReservaCasoUso } from './aplicacion/casos-uso/crear-reserva.caso-uso';
import { ListarReservasCasoUso } from './aplicacion/casos-uso/listar-reservas.caso-uso';
import { ObtenerReservaCasoUso } from './aplicacion/casos-uso/obtener-reserva.caso-uso';
import { REPOSITORIO_RESERVAS } from './dominio/repositorios/repositorio-reservas';
import { ReservasControlador } from './infraestructura/http/reservas.controlador';
import { ReservaOrmEntidad } from './infraestructura/persistencia/typeorm/reserva.orm-entidad';
import { RepositorioReservasTypeOrm } from './infraestructura/persistencia/typeorm/repositorio-reservas.typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReservaOrmEntidad]),
    PacientesModule,
    ProfesionalesModule,
    EspecialidadesModule,
    UsuariosModule,
  ],
  controllers: [ReservasControlador],
  providers: [
    CrearReservaCasoUso,
    ListarReservasCasoUso,
    ObtenerReservaCasoUso,
    CancelarReservaCasoUso,
    ActualizarEstadoReservaCasoUso,
    { provide: REPOSITORIO_RESERVAS, useClass: RepositorioReservasTypeOrm },
  ],
})
export class ReservasModule {}
