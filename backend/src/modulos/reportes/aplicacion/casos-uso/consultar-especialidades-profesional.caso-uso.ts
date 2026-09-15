import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { UsuarioAutenticado } from '../../../usuarios/aplicacion/servicios/auth.servicio';
import {
  EspecialidadProfesionalReporte,
} from '../../dominio/modelos/reporte-reservas';
import {
  REPOSITORIO_REPORTES_RESERVAS,
  RepositorioReportesReservas,
} from '../../dominio/repositorios/repositorio-reportes-reservas';

@Injectable()
export class ConsultarEspecialidadesProfesionalCasoUso {
  constructor(
    @Inject(REPOSITORIO_REPORTES_RESERVAS)
    private readonly repositorio: RepositorioReportesReservas,
  ) {}

  async ejecutar(usuario: UsuarioAutenticado): Promise<EspecialidadProfesionalReporte[]> {
    if (usuario.rol === 'ADMIN') {
      throw new ForbiddenException('Las especialidades del profesional solo aplican a especialistas');
    }
    const vinculado = usuario.profesionalId;
    if (!vinculado) {
      throw new ForbiddenException('El especialista no tiene un profesional vinculado');
    }
    return this.repositorio.listarEspecialidadesDeProfesional(vinculado);
  }
}