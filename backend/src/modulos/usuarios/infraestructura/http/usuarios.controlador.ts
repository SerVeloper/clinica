import { Body, Controller, Get, Post } from '@nestjs/common';
import { mapearError } from '../../../../compartido/infraestructura/filtros/mapear-error';
import { Roles } from '../../../../compartido/infraestructura/decorators/roles.decorator';
import { CrearUsuarioDto } from '../../aplicacion/dtos/crear-usuario.dto';
import { UsuariosServicio } from '../../aplicacion/servicios/usuarios.servicio';

@Controller('usuarios')
export class UsuariosControlador {
  constructor(private readonly usuarios: UsuariosServicio) {}

  @Get()
  @Roles('ADMIN')
  listar() {
    return this.usuarios.listar();
  }

  @Post()
  @Roles('ADMIN')
  async crear(@Body() dto: CrearUsuarioDto) {
    try {
      return await this.usuarios.crear(dto);
    } catch (error) {
      mapearError(error);
    }
  }
}