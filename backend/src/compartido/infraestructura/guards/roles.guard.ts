import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolUsuario } from '../../../modulos/usuarios/dominio/entidades/rol-usuario';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(contexto: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<RolUsuario[]>(ROLES_KEY, [
      contexto.getHandler(),
      contexto.getClass(),
    ]);
    if (!roles || roles.length === 0) return true;

    const request = contexto.switchToHttp().getRequest();
    const rol = request.usuario?.rol as RolUsuario | undefined;

    if (!rol || !roles.includes(rol)) {
      throw new ForbiddenException('No tiene permisos para realizar esta acción');
    }

    return true;
  }
}