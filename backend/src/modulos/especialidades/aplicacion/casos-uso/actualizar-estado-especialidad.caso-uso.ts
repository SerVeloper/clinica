import { Inject, Injectable } from '@nestjs/common';
import { ErrorNegocio } from '../../../../compartido/dominio/error-negocio';
import { REPOSITORIO_ESPECIALIDADES, RepositorioEspecialidades } from '../../dominio/repositorios/repositorio-especialidades';
import { ActualizarEstadoEspecialidadDto } from '../dtos/actualizar-estado-especialidad.dto';

@Injectable()
export class ActualizarEstadoEspecialidadCasoUso {
  constructor(@Inject(REPOSITORIO_ESPECIALIDADES) private readonly repositorio: RepositorioEspecialidades) {}

  async ejecutar(id: string, dto: ActualizarEstadoEspecialidadDto) {
    const especialidad = await this.repositorio.buscarPorId(id);
    if (!especialidad) throw new ErrorNegocio('Especialidad no encontrada');

    return this.repositorio.cambiarEstado(id, dto.activo);
  }
}
