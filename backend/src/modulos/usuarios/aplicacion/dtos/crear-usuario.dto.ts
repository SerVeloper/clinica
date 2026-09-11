import { IsBoolean, IsIn, IsOptional, IsString, IsUUID, MinLength, ValidateIf } from 'class-validator';
import { ROLES_USUARIO, RolUsuario } from '../../dominio/entidades/rol-usuario';

export class CrearUsuarioDto {
  @IsString()
  @MinLength(1)
  nombre: string;

  @IsString()
  @MinLength(1)
  apellido: string;

  @IsString()
  @MinLength(3)
  usuario: string;

  @IsString()
  @MinLength(1)
  password: string;

  @IsIn(ROLES_USUARIO)
  rol: RolUsuario;

  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== '')
  @IsUUID()
  profesionalId?: string | null;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
