import { Inject, Injectable } from '@nestjs/common';
import { CrearPacienteDto } from '../dtos/crear-paciente.dto';
import { REPOSITORIO_PACIENTES, RepositorioPacientes } from '../../dominio/repositorios/repositorio-pacientes';

@Injectable()
export class CrearPacienteCasoUso {
  constructor(@Inject(REPOSITORIO_PACIENTES) private readonly repositorio: RepositorioPacientes) {}

  ejecutar(dto: CrearPacienteDto) {
    return this.repositorio.guardar({ ...dto, email: dto.email ?? null, activo: true });
  }
}
