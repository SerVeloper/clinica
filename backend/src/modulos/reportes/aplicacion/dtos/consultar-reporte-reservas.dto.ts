import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { EstadoReserva } from '../../../reservas/dominio/entidades/estado-reserva';

export class ConsultarReporteReservasDto {
  @ApiProperty({ enum: ['FECHA', 'MES', 'RANGO'] })
  @IsOptional()
  @IsIn(['FECHA', 'MES', 'RANGO'])
  modo?: 'FECHA' | 'MES' | 'RANGO';

  @ApiPropertyOptional({ example: '2026-09-13' })
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @ApiPropertyOptional({ example: '2026-09' })
  @IsOptional()
  @IsString()
  mes?: string;

  @ApiPropertyOptional({ example: '2026-09-01' })
  @IsOptional()
  @IsDateString()
  desde?: string;

  @ApiPropertyOptional({ example: '2026-09-30' })
  @IsOptional()
  @IsDateString()
  hasta?: string;

  @ApiPropertyOptional({ enum: EstadoReserva })
  @IsOptional()
  @IsEnum(EstadoReserva)
  estado?: EstadoReserva;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  profesionalId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  especialidadId?: string;
}