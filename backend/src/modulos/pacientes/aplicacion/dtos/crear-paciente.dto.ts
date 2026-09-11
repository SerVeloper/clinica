import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CrearPacienteDto {
  @ApiProperty({ example: 'Ana' })
  @IsString()
  @MinLength(2)
  nombre: string;

  @ApiProperty({ example: 'García' })
  @IsString()
  @MinLength(2)
  apellido: string;

  @ApiProperty({ example: '+5491112345678' })
  @IsString()
  telefono: string;

  @ApiPropertyOptional({ example: 'ana@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}
