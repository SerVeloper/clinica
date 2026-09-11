import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORIO_ESPECIALIDADES, RepositorioEspecialidades } from '../../dominio/repositorios/repositorio-especialidades';
import { ListarEspecialidadesDto } from '../dtos/listar-especialidades.dto';

@Injectable()
export class ListarEspecialidadesCasoUso {
  constructor(@Inject(REPOSITORIO_ESPECIALIDADES) private readonly repositorio: RepositorioEspecialidades) {}

  ejecutar(filtros?: ListarEspecialidadesDto) {
    return this.repositorio.listar(filtros);
  }
}
