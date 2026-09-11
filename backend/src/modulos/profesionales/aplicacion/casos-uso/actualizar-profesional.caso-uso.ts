import { Inject, Injectable } from '@nestjs/common';
import { ErrorNegocio } from '../../../../compartido/dominio/error-negocio';
import { REPOSITORIO_ESPECIALIDADES, RepositorioEspecialidades } from '../../../especialidades/dominio/repositorios/repositorio-especialidades';
import { REPOSITORIO_PROFESIONALES, RepositorioProfesionales } from '../../dominio/repositorios/repositorio-profesionales';
import { ActualizarProfesionalDto } from '../dtos/actualizar-profesional.dto';

@Injectable()
export class ActualizarProfesionalCasoUso {
  constructor(
    @Inject(REPOSITORIO_PROFESIONALES) private readonly profesionales: RepositorioProfesionales,
    @Inject(REPOSITORIO_ESPECIALIDADES) private readonly especialidades: RepositorioEspecialidades,
  ) {}

  async ejecutar(id: string, dto: ActualizarProfesionalDto) {
    const [profesional, especialidad] = await Promise.all([this.profesionales.buscarPorId(id), this.especialidades.buscarPorId(dto.especialidadId)]);
    if (!profesional) throw new ErrorNegocio('Profesional no encontrado');
    if (!especialidad) throw new ErrorNegocio('Especialidad no encontrada');
    if (!especialidad.activo) throw new ErrorNegocio('No se puede asignar una especialidad inactiva al profesional');

    return this.profesionales.actualizar(id, {
      nombre: dto.nombre.trim(),
      apellido: dto.apellido.trim(),
      telefono: dto.telefono.trim(),
      especialidadId: dto.especialidadId,
    });
  }
}
