import { Inject, Injectable } from '@nestjs/common';
import { ErrorNegocio } from '../../../../compartido/dominio/error-negocio';
import { REPOSITORIO_ESPECIALIDADES, RepositorioEspecialidades } from '../../../especialidades/dominio/repositorios/repositorio-especialidades';
import { REPOSITORIO_PROFESIONALES, RepositorioProfesionales } from '../../dominio/repositorios/repositorio-profesionales';
import { CrearProfesionalDto } from '../dtos/crear-profesional.dto';

@Injectable()
export class CrearProfesionalCasoUso {
  constructor(
    @Inject(REPOSITORIO_PROFESIONALES) private readonly profesionales: RepositorioProfesionales,
    @Inject(REPOSITORIO_ESPECIALIDADES) private readonly especialidades: RepositorioEspecialidades,
  ) {}

  async ejecutar(dto: CrearProfesionalDto) {
    const especialidad = await this.especialidades.buscarPorId(dto.especialidadId);
    if (!especialidad) throw new ErrorNegocio('Especialidad no encontrada');
    if (!especialidad.activo) throw new ErrorNegocio('No se puede crear un profesional con una especialidad inactiva');

    return this.profesionales.guardar({ ...dto, activo: true });
  }
}
