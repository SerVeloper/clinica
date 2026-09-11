import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { FiltrosPaginacion } from '../../../../compartido/aplicacion/paginacion';

export class ListarEspecialidadesDto implements FiltrosPaginacion {
  @ApiPropertyOptional({ description: 'Texto a buscar por nombre' })
  @IsOptional()
  @IsString()
  buscar?: string;

  @ApiPropertyOptional({ description: 'Filtra por estado activo: true o false' })
  @IsOptional()
  activo?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  pagina?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  limite?: string;
}
