import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ActualizarEstadoPacienteDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  activo: boolean;
}
