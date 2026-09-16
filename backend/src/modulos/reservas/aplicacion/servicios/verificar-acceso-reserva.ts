import { ErrorNegocio } from '../../../../compartido/dominio/error-negocio';
import { UsuarioAutenticado } from '../../../usuarios/aplicacion/servicios/auth.servicio';
import { Reserva } from '../../dominio/entidades/reserva';

export function verificarAccesoReserva(reserva: Reserva, usuario: UsuarioAutenticado): void {
  if (usuario.rol === 'ADMIN') return;
  if (!usuario.profesionalId || reserva.profesionalId !== usuario.profesionalId) {
    throw new ErrorNegocio('Reserva no encontrada', 'NO_ENCONTRADO');
  }
}