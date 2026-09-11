import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { mapearError } from '../../../../compartido/infraestructura/filtros/mapear-error';
import { Roles } from '../../../../compartido/infraestructura/decorators/roles.decorator';
import { ActualizarPacienteCasoUso } from '../../aplicacion/casos-uso/actualizar-paciente.caso-uso';
import { ActualizarEstadoPacienteCasoUso } from '../../aplicacion/casos-uso/actualizar-estado-paciente.caso-uso';
import { CrearPacienteCasoUso } from '../../aplicacion/casos-uso/crear-paciente.caso-uso';
import { ListarPacientesCasoUso } from '../../aplicacion/casos-uso/listar-pacientes.caso-uso';
import { ActualizarPacienteDto } from '../../aplicacion/dtos/actualizar-paciente.dto';
import { ActualizarEstadoPacienteDto } from '../../aplicacion/dtos/actualizar-estado-paciente.dto';
import { CrearPacienteDto } from '../../aplicacion/dtos/crear-paciente.dto';
import { ListarPacientesDto } from '../../aplicacion/dtos/listar-pacientes.dto';

@ApiTags('Pacientes')
@Controller('pacientes')
export class PacientesControlador {
  constructor(
    private readonly crearPaciente: CrearPacienteCasoUso,
    private readonly actualizarPaciente: ActualizarPacienteCasoUso,
    private readonly actualizarEstadoPaciente: ActualizarEstadoPacienteCasoUso,
    private readonly listarPacientes: ListarPacientesCasoUso,
  ) {}

  @Post()
  @ApiCreatedResponse({ description: 'Crea un paciente' })
  async crear(@Body() dto: CrearPacienteDto) {
    try {
      return await this.crearPaciente.ejecutar(dto);
    } catch (error) {
      mapearError(error);
    }
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Actualiza un paciente' })
  async actualizar(@Param('id') id: string, @Body() dto: ActualizarPacienteDto) {
    try {
      return await this.actualizarPaciente.ejecutar(id, dto);
    } catch (error) {
      mapearError(error);
    }
  }

  @Patch(':id/estado')
  @Roles('ADMIN')
  @ApiOkResponse({ description: 'Activa o desactiva un paciente' })
  async actualizarEstado(@Param('id') id: string, @Body() dto: ActualizarEstadoPacienteDto) {
    try {
      return await this.actualizarEstadoPaciente.ejecutar(id, dto);
    } catch (error) {
      mapearError(error);
    }
  }

  @Get()
  @ApiOkResponse({ description: 'Lista pacientes' })
  listar(@Query() filtros: ListarPacientesDto) {
    return this.listarPacientes.ejecutar(filtros);
  }
}
