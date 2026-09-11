import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthServicio } from '../../../modulos/usuarios/aplicacion/servicios/auth.servicio';
import { PUBLICO_KEY } from '../decorators/publico.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authServicio: AuthServicio,
  ) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const esPublico = this.reflector.getAllAndOverride<boolean>(PUBLICO_KEY, [
      contexto.getHandler(),
      contexto.getClass(),
    ]);
    if (esPublico) return true;

    const request = contexto.switchToHttp().getRequest();
    const authorization = request.headers.authorization as string | undefined;

    request.usuario = await this.authServicio.obtenerUsuarioDesdeHeader(authorization);
    return true;
  }
}