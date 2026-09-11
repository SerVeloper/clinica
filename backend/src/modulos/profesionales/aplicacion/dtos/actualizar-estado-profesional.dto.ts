import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ActualizarEstadoProfesionalDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  activo: boolean;
}
