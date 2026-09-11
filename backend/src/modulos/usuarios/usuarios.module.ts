import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfesionalesModule } from '../profesionales/profesionales.module';
import { REPOSITORIO_USUARIOS } from './dominio/repositorios/repositorio-usuarios';
import { PasswordServicio } from './aplicacion/servicios/password.servicio';
import { AuthServicio } from './aplicacion/servicios/auth.servicio';
import { UsuariosServicio } from './aplicacion/servicios/usuarios.servicio';
import { AuthControlador } from './infraestructura/http/auth.controlador';
import { UsuariosControlador } from './infraestructura/http/usuarios.controlador';
import { RepositorioUsuariosTypeOrm } from './infraestructura/persistencia/typeorm/repositorio-usuarios.typeorm';
import { UsuarioOrmEntidad } from './infraestructura/persistencia/typeorm/usuario.orm-entidad';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([UsuarioOrmEntidad]), ProfesionalesModule],
  controllers: [AuthControlador, UsuariosControlador],
  providers: [
    PasswordServicio,
    AuthServicio,
    UsuariosServicio,
    { provide: REPOSITORIO_USUARIOS, useClass: RepositorioUsuariosTypeOrm },
  ],
  exports: [AuthServicio, UsuariosServicio, REPOSITORIO_USUARIOS],
})
export class UsuariosModule {}
