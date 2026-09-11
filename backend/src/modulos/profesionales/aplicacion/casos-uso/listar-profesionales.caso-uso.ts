import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORIO_PROFESIONALES, RepositorioProfesionales } from '../../dominio/repositorios/repositorio-profesionales';
import { ListarProfesionalesDto } from '../dtos/listar-profesionales.dto';

@Injectable()
export class ListarProfesionalesCasoUso {
  constructor(@Inject(REPOSITORIO_PROFESIONALES) private readonly repositorio: RepositorioProfesionales) {}

  ejecutar(filtros?: ListarProfesionalesDto) {
    return this.repositorio.listar(filtros);
  }
}
