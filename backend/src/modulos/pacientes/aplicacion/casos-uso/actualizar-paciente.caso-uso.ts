import { Inject, Injectable } from '@nestjs/common';
import { ErrorNegocio } from '../../../../compartido/dominio/error-negocio';
import { REPOSITORIO_PACIENTES, RepositorioPacientes } from '../../dominio/repositorios/repositorio-pacientes';
import { ActualizarPacienteDto } from '../dtos/actualizar-paciente.dto';

@Injectable()
export class ActualizarPacienteCasoUso {
  constructor(@Inject(REPOSITORIO_PACIENTES) private readonly repositorio: RepositorioPacientes) {}

  async ejecutar(id: string, dto: ActualizarPacienteDto) {
    const paciente = await this.repositorio.buscarPorId(id);
    if (!paciente) throw new ErrorNegocio('Paciente no encontrado');

    return this.repositorio.actualizar(id, {
      nombre: dto.nombre.trim(),
      apellido: dto.apellido.trim(),
      telefono: dto.telefono.trim(),
      email: dto.email?.trim() || null,
    });
  }
}
