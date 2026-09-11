import { SetMetadata } from '@nestjs/common';
import { RolUsuario } from '../../../modulos/usuarios/dominio/entidades/rol-usuario';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: RolUsuario[]) => SetMetadata(ROLES_KEY, roles);