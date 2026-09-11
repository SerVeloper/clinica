import { Inject, Injectable } from '@nestjs/common';
import { ErrorNegocio } from '../../../../compartido/dominio/error-negocio';
import { REPOSITORIO_ESPECIALIDADES, RepositorioEspecialidades } from '../../dominio/repositorios/repositorio-especialidades';
import { CrearEspecialidadDto } from '../dtos/crear-especialidad.dto';

@Injectable()
export class CrearEspecialidadCasoUso {
  constructor(@Inject(REPOSITORIO_ESPECIALIDADES) private readonly repositorio: RepositorioEspecialidades) {}

  async ejecutar(dto: CrearEspecialidadDto) {
    const nombre = dto.nombre.trim();
    const existente = await this.repositorio.buscarPorNombre(nombre);
    if (existente) throw new ErrorNegocio('Ya existe una especialidad con ese nombre');

    return this.repositorio.guardar({ nombre, duracionMinutos: dto.duracionMinutos, activo: true });
  }
}
