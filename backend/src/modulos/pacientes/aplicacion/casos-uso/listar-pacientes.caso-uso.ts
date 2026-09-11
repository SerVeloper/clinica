import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORIO_PACIENTES, RepositorioPacientes } from '../../dominio/repositorios/repositorio-pacientes';
import { ListarPacientesDto } from '../dtos/listar-pacientes.dto';

@Injectable()
export class ListarPacientesCasoUso {
  constructor(@Inject(REPOSITORIO_PACIENTES) private readonly repositorio: RepositorioPacientes) {}

  ejecutar(filtros?: ListarPacientesDto) {
    return this.repositorio.listar(filtros);
  }
}
