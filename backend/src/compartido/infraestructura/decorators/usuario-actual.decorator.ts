import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UsuarioAutenticado } from '../../../modulos/usuarios/aplicacion/servicios/auth.servicio';

export const UsuarioActual = createParamDecorator(
  (_data: unknown, contexto: ExecutionContext): UsuarioAutenticado => {
    const request = contexto.switchToHttp().getRequest();
    return request.usuario as UsuarioAutenticado;
  },
);