import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { FiltrosPaginacion } from '../../../../compartido/aplicacion/paginacion';

export class ListarPacientesDto implements FiltrosPaginacion {
  @ApiPropertyOptional({ description: 'Texto a buscar por nombre, apellido, teléfono o email' })
  @IsOptional()
  @IsString()
  buscar?: string;

  @ApiPropertyOptional({ description: 'Filtrar por estado activo: true o false' })
  @IsOptional()
  @IsString()
  activo?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  pagina?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  limite?: string;
}
