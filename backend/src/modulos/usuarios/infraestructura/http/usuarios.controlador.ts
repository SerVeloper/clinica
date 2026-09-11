import { Body, Controller, ForbiddenException, Get, Headers, Post } from '@nestjs/common';
import { mapearError } from '../../../../compartido/infraestructura/filtros/mapear-error';
import { CrearUsuarioDto } from '../../aplicacion/dtos/crear-usuario.dto';
import { AuthServicio } from '../../aplicacion/servicios/auth.servicio';
import { UsuariosServicio } from '../../aplicacion/servicios/usuarios.servicio';

@Controller('usuarios')
export class UsuariosControlador {
  constructor(
    private readonly usuarios: UsuariosServicio,
    private readonly auth: AuthServicio,
  ) {}

  @Get()
  async listar(@Headers('authorization') authorization?: string) {
    await this.auth.obtenerUsuarioDesdeHeader(authorization);
    return this.usuarios.listar();
  }

  @Post()
  async crear(@Headers('authorization') authorization: string | undefined, @Body() dto: CrearUsuarioDto) {
    try {
      const actual = await this.auth.obtenerUsuarioDesdeHeader(authorization);
      if (actual.rol !== 'ADMIN') throw new ForbiddenException('Solo un administrador puede crear usuarios');

      return await this.usuarios.crear(dto);
    } catch (error) {
      mapearError(error);
    }
  }
}
