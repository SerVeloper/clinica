import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { mapearError } from '../../../../compartido/infraestructura/filtros/mapear-error';
import { UsuarioActual } from '../../../../compartido/infraestructura/decorators/usuario-actual.decorator';
import { ActualizarEstadoReservaCasoUso } from '../../aplicacion/casos-uso/actualizar-estado-reserva.caso-uso';
import { CancelarReservaCasoUso } from '../../aplicacion/casos-uso/cancelar-reserva.caso-uso';
import { CrearReservaCasoUso } from '../../aplicacion/casos-uso/crear-reserva.caso-uso';
import { ListarReservasCasoUso } from '../../aplicacion/casos-uso/listar-reservas.caso-uso';
import { ObtenerReservaCasoUso } from '../../aplicacion/casos-uso/obtener-reserva.caso-uso';
import { UsuarioAutenticado } from '../../../usuarios/aplicacion/servicios/auth.servicio';
import { ActualizarEstadoReservaDto } from '../../aplicacion/dtos/actualizar-estado-reserva.dto';
import { CrearReservaDto } from '../../aplicacion/dtos/crear-reserva.dto';
import { ListarReservasDto } from '../../aplicacion/dtos/listar-reservas.dto';

@ApiTags('Reservas')
@Controller('reservas')
export class ReservasControlador {
  constructor(
    private readonly crearReserva: CrearReservaCasoUso,
    private readonly listarReservas: ListarReservasCasoUso,
    private readonly obtenerReserva: ObtenerReservaCasoUso,
    private readonly cancelarReserva: CancelarReservaCasoUso,
    private readonly actualizarEstadoReserva: ActualizarEstadoReservaCasoUso,
  ) {}

  @Post()
  @ApiCreatedResponse({ description: 'Crea una reserva' })
  async crear(@UsuarioActual() usuario: UsuarioAutenticado, @Body() dto: CrearReservaDto) {
    try {
      return await this.crearReserva.ejecutar(dto, usuario);
    } catch (error) {
      mapearError(error);
    }
  }

  @Get()
  @ApiOkResponse({ description: 'Lista reservas con filtros opcionales' })
  listar(@Query() filtros: ListarReservasDto) {
    return this.listarReservas.ejecutar(filtros);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Obtiene una reserva por id' })
  async obtener(@Param('id') id: string) {
    try {
      return await this.obtenerReserva.ejecutar(id);
    } catch (error) {
      mapearError(error);
    }
  }

  @Patch(':id/cancelar')
  @ApiOkResponse({ description: 'Cancela una reserva' })
  async cancelar(@Param('id') id: string) {
    try {
      return await this.cancelarReserva.ejecutar(id);
    } catch (error) {
      mapearError(error);
    }
  }

  @Patch(':id/estado')
  @ApiOkResponse({ description: 'Actualiza el estado de una reserva' })
  async actualizarEstado(@Param('id') id: string, @Body() dto: ActualizarEstadoReservaDto) {
    try {
      return await this.actualizarEstadoReserva.ejecutar(id, dto);
    } catch (error) {
      mapearError(error);
    }
  }
}
