import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { EstadoReserva } from '../../dominio/entidades/estado-reserva';

export class ActualizarEstadoReservaDto {
  @ApiProperty({ enum: EstadoReserva })
  @IsEnum(EstadoReserva)
  estado: EstadoReserva;
}
