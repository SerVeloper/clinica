import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { mapearError } from '../../../../compartido/infraestructura/filtros/mapear-error';
import { Roles } from '../../../../compartido/infraestructura/decorators/roles.decorator';
import { ActualizarProfesionalCasoUso } from '../../aplicacion/casos-uso/actualizar-profesional.caso-uso';
import { ActualizarEstadoProfesionalCasoUso } from '../../aplicacion/casos-uso/actualizar-estado-profesional.caso-uso';
import { CrearProfesionalCasoUso } from '../../aplicacion/casos-uso/crear-profesional.caso-uso';
import { ListarProfesionalesCasoUso } from '../../aplicacion/casos-uso/listar-profesionales.caso-uso';
import { ActualizarProfesionalDto } from '../../aplicacion/dtos/actualizar-profesional.dto';
import { ActualizarEstadoProfesionalDto } from '../../aplicacion/dtos/actualizar-estado-profesional.dto';
import { CrearProfesionalDto } from '../../aplicacion/dtos/crear-profesional.dto';
import { ListarProfesionalesDto } from '../../aplicacion/dtos/listar-profesionales.dto';

@ApiTags('Profesionales')
@Controller('profesionales')
export class ProfesionalesControlador {
  constructor(
    private readonly crearProfesional: CrearProfesionalCasoUso,
    private readonly actualizarProfesional: ActualizarProfesionalCasoUso,
    private readonly actualizarEstadoProfesional: ActualizarEstadoProfesionalCasoUso,
    private readonly listarProfesionales: ListarProfesionalesCasoUso,
  ) {}

  @Post()
  @Roles('ADMIN')
  @ApiCreatedResponse({ description: 'Crea un profesional' })
  async crear(@Body() dto: CrearProfesionalDto) {
    try {
      return await this.crearProfesional.ejecutar(dto);
    } catch (error) {
      mapearError(error);
    }
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOkResponse({ description: 'Actualiza un profesional' })
  async actualizar(@Param('id') id: string, @Body() dto: ActualizarProfesionalDto) {
    try {
      return await this.actualizarProfesional.ejecutar(id, dto);
    } catch (error) {
      mapearError(error);
    }
  }

  @Patch(':id/estado')
  @Roles('ADMIN')
  @ApiOkResponse({ description: 'Activa o desactiva un profesional' })
  async actualizarEstado(@Param('id') id: string, @Body() dto: ActualizarEstadoProfesionalDto) {
    try {
      return await this.actualizarEstadoProfesional.ejecutar(id, dto);
    } catch (error) {
      mapearError(error);
    }
  }

  @Get()
  @ApiOkResponse({ description: 'Lista profesionales' })
  listar(@Query() filtros: ListarProfesionalesDto) {
    return this.listarProfesionales.ejecutar(filtros);
  }
}
