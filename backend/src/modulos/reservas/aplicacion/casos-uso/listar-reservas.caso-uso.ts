import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORIO_RESERVAS, RepositorioReservas } from '../../dominio/repositorios/repositorio-reservas';
import { ListarReservasDto } from '../dtos/listar-reservas.dto';

@Injectable()
export class ListarReservasCasoUso {
  constructor(@Inject(REPOSITORIO_RESERVAS) private readonly repositorio: RepositorioReservas) {}

  ejecutar(filtros: ListarReservasDto) {
    return this.repositorio.listar(filtros);
  }
}
