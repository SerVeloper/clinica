import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MinLength } from 'class-validator';

export class CrearEspecialidadDto {
  @ApiProperty({ example: 'Fisioterapia' })
  @IsString()
  @MinLength(2)
  nombre: string;

  @ApiProperty({ enum: [15, 30, 60], example: 60 })
  @IsIn([15, 30, 60], { message: 'La duración debe ser 15, 30 o 60 minutos' })
  duracionMinutos: number;
}
