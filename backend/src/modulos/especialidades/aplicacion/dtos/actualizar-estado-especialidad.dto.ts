import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ActualizarEstadoEspecialidadDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  activo: boolean;
}
