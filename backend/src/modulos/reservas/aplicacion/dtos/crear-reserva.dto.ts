import { ApiProperty } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { EstadoReserva } from '../../dominio/entidades/estado-reserva';

export class CrearReservaDto {
  @ApiProperty({ description: 'ID del paciente' })
  @IsUUID()
  pacienteId: string;

  @ApiProperty({ description: 'ID del profesional' })
  @IsUUID()
  profesionalId: string;

  @ApiProperty({ description: 'ID de la especialidad' })
  @IsUUID()
  especialidadId: string;

  @ApiProperty({ example: '2026-08-01T10:00:00.000' })
  @IsDateString()
  fechaInicio: string;

  @ApiPropertyOptional({ enum: EstadoReserva, default: EstadoReserva.PENDIENTE })
  @IsOptional()
  @IsEnum(EstadoReserva)
  estado?: EstadoReserva;
}
