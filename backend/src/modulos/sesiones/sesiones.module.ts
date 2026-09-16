import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SesionesServicio } from './aplicacion/servicios/sesiones.servicio';
import { REPOSITORIO_SESIONES } from './dominio/repositorios/repositorio-sesiones';
import { SesionOrmEntidad } from './infraestructura/persistencia/typeorm/sesion.orm-entidad';
import { RepositorioSesionesTypeOrm } from './infraestructura/persistencia/typeorm/repositorio-sesiones.typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([SesionOrmEntidad])],
  providers: [
    SesionesServicio,
    { provide: REPOSITORIO_SESIONES, useClass: RepositorioSesionesTypeOrm },
  ],
  exports: [SesionesServicio, REPOSITORIO_SESIONES],
})
export class SesionesModule {}