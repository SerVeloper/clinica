import { Inject, Injectable } from '@nestjs/common';
import { ErrorNegocio } from '../../../../compartido/dominio/error-negocio';
import { REPOSITORIO_PROFESIONALES, RepositorioProfesionales } from '../../dominio/repositorios/repositorio-profesionales';
import { ActualizarEstadoProfesionalDto } from '../dtos/actualizar-estado-profesional.dto';

@Injectable()
export class ActualizarEstadoProfesionalCasoUso {
  constructor(@Inject(REPOSITORIO_PROFESIONALES) private readonly repositorio: RepositorioProfesionales) {}

  async ejecutar(id: string, dto: ActualizarEstadoProfesionalDto) {
    const profesional = await this.repositorio.buscarPorId(id);
    if (!profesional) throw new ErrorNegocio('Profesional no encontrado');

    return this.repositorio.cambiarEstado(id, dto.activo);
  }
}
