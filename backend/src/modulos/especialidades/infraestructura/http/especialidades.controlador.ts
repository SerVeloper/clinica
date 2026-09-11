import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { mapearError } from '../../../../compartido/infraestructura/filtros/mapear-error';
import { ActualizarEspecialidadCasoUso } from '../../aplicacion/casos-uso/actualizar-especialidad.caso-uso';
import { ActualizarEstadoEspecialidadCasoUso } from '../../aplicacion/casos-uso/actualizar-estado-especialidad.caso-uso';
import { CrearEspecialidadCasoUso } from '../../aplicacion/casos-uso/crear-especialidad.caso-uso';
import { ListarEspecialidadesCasoUso } from '../../aplicacion/casos-uso/listar-especialidades.caso-uso';
import { ActualizarEspecialidadDto } from '../../aplicacion/dtos/actualizar-especialidad.dto';
import { ActualizarEstadoEspecialidadDto } from '../../aplicacion/dtos/actualizar-estado-especialidad.dto';
import { CrearEspecialidadDto } from '../../aplicacion/dtos/crear-especialidad.dto';
import { ListarEspecialidadesDto } from '../../aplicacion/dtos/listar-especialidades.dto';

@ApiTags('Especialidades')
@Controller('especialidades')
export class EspecialidadesControlador {
  constructor(
    private readonly crearEspecialidad: CrearEspecialidadCasoUso,
    private readonly actualizarEspecialidad: ActualizarEspecialidadCasoUso,
    private readonly actualizarEstadoEspecialidad: ActualizarEstadoEspecialidadCasoUso,
    private readonly listarEspecialidades: ListarEspecialidadesCasoUso,
  ) {}

  @Post()
  @ApiCreatedResponse({ description: 'Crea una especialidad' })
  async crear(@Body() dto: CrearEspecialidadDto) {
    try {
      return await this.crearEspecialidad.ejecutar(dto);
    } catch (error) {
      mapearError(error);
    }
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Actualiza una especialidad' })
  async actualizar(@Param('id') id: string, @Body() dto: ActualizarEspecialidadDto) {
    try {
      return await this.actualizarEspecialidad.ejecutar(id, dto);
    } catch (error) {
      mapearError(error);
    }
  }

  @Patch(':id/estado')
  @ApiOkResponse({ description: 'Activa o desactiva una especialidad' })
  async actualizarEstado(@Param('id') id: string, @Body() dto: ActualizarEstadoEspecialidadDto) {
    try {
      return await this.actualizarEstadoEspecialidad.ejecutar(id, dto);
    } catch (error) {
      mapearError(error);
    }
  }

  @Get()
  @ApiOkResponse({ description: 'Lista las especialidades disponibles' })
  listar(@Query() filtros: ListarEspecialidadesDto) {
    return this.listarEspecialidades.ejecutar(filtros);
  }
}
