import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { EstadoReserva } from '../../dominio/entidades/estado-reserva';

export class ListarReservasDto {
  @ApiPropertyOptional({ example: '2026-08-01' })
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  profesionalId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  pacienteId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  especialidadId?: string;

  @ApiPropertyOptional({ enum: EstadoReserva })
  @IsOptional()
  @IsEnum(EstadoReserva)
  estado?: EstadoReserva;
}
