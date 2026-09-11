import { Inject, Injectable } from '@nestjs/common';
import { ErrorNegocio } from '../../../../compartido/dominio/error-negocio';
import { REPOSITORIO_ESPECIALIDADES, RepositorioEspecialidades } from '../../dominio/repositorios/repositorio-especialidades';
import { ActualizarEspecialidadDto } from '../dtos/actualizar-especialidad.dto';

@Injectable()
export class ActualizarEspecialidadCasoUso {
  constructor(@Inject(REPOSITORIO_ESPECIALIDADES) private readonly repositorio: RepositorioEspecialidades) {}

  async ejecutar(id: string, dto: ActualizarEspecialidadDto) {
    const especialidad = await this.repositorio.buscarPorId(id);
    if (!especialidad) throw new ErrorNegocio('Especialidad no encontrada');

    const nombre = dto.nombre.trim();
    const existente = await this.repositorio.buscarPorNombre(nombre);
    if (existente && existente.id !== id) throw new ErrorNegocio('Ya existe una especialidad con ese nombre');

    return this.repositorio.actualizar(id, { nombre, duracionMinutos: dto.duracionMinutos });
  }
}
