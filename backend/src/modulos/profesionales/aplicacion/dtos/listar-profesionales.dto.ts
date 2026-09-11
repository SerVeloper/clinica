import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { FiltrosPaginacion } from '../../../../compartido/aplicacion/paginacion';

export class ListarProfesionalesDto implements FiltrosPaginacion {
  @ApiPropertyOptional({ description: 'Texto a buscar por nombre o apellido' })
  @IsOptional()
  @IsString()
  buscar?: string;

  @ApiPropertyOptional({ description: 'ID de la especialidad' })
  @IsOptional()
  @IsUUID()
  especialidadId?: string;

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
