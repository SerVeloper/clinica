import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MinLength } from 'class-validator';

export class CrearProfesionalDto {
  @ApiProperty({ example: 'Juan' })
  @IsString()
  @MinLength(2)
  nombre: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @MinLength(2)
  apellido: string;

  @ApiProperty({ example: '+5491112345678' })
  @IsString()
  telefono: string;

  @ApiProperty({ description: 'ID de la especialidad' })
  @IsUUID()
  especialidadId: string;
}
