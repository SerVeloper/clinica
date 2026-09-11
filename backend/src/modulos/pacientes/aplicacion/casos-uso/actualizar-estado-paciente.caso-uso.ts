import { Inject, Injectable } from '@nestjs/common';
import { ErrorNegocio } from '../../../../compartido/dominio/error-negocio';
import { REPOSITORIO_PACIENTES, RepositorioPacientes } from '../../dominio/repositorios/repositorio-pacientes';
import { ActualizarEstadoPacienteDto } from '../dtos/actualizar-estado-paciente.dto';

@Injectable()
export class ActualizarEstadoPacienteCasoUso {
  constructor(@Inject(REPOSITORIO_PACIENTES) private readonly repositorio: RepositorioPacientes) {}

  async ejecutar(id: string, dto: ActualizarEstadoPacienteDto) {
    const paciente = await this.repositorio.buscarPorId(id);
    if (!paciente) throw new ErrorNegocio('Paciente no encontrado');

    return this.repositorio.cambiarEstado(id, dto.activo);
  }
}
