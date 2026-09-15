import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EspecialidadOrmEntidad } from '../../../../especialidades/infraestructura/persistencia/typeorm/especialidad.orm-entidad';
import { ProfesionalOrmEntidad } from '../../../../profesionales/infraestructura/persistencia/typeorm/profesional.orm-entidad';
import { EstadoReserva } from '../../../../reservas/dominio/entidades/estado-reserva';
import { ReservaOrmEntidad } from '../../../../reservas/infraestructura/persistencia/typeorm/reserva.orm-entidad';
import {
  ConsultaReporteReservas,
  EspecialidadProfesionalReporte,
  FilaAgregadoReporteReservas,
} from '../../../dominio/modelos/reporte-reservas';
import { RepositorioReportesReservas } from '../../../dominio/repositorios/repositorio-reportes-reservas';

interface FilaAgregadoCruda {
  estado: EstadoReserva;
  profesionalId: string | null;
  profesionalApellido: string | null;
  profesionalNombre: string | null;
  especialidadId: string | null;
  especialidadNombre: string | null;
  cantidad: string;
}

@Injectable()
export class RepositorioReportesReservasTypeOrm implements RepositorioReportesReservas {
  constructor(
    @InjectRepository(ReservaOrmEntidad)
    private readonly reservas: Repository<ReservaOrmEntidad>,
  ) {}

  async agregar(consulta: ConsultaReporteReservas): Promise<FilaAgregadoReporteReservas[]> {
    const consultaBuilder = this.reservas
      .createQueryBuilder('r')
      .leftJoin(ProfesionalOrmEntidad, 'p', 'p.id = r.profesional_id')
      .leftJoin(EspecialidadOrmEntidad, 'e', 'e.id = r.especialidad_id')
      .select('r.estado', 'estado')
      .addSelect('p.id', 'profesionalId')
      .addSelect('p.apellido', 'profesionalApellido')
      .addSelect('p.nombre', 'profesionalNombre')
      .addSelect('e.id', 'especialidadId')
      .addSelect('e.nombre', 'especialidadNombre')
      .addSelect('COUNT(*)', 'cantidad')
      .where('r.fecha_inicio >= :desde', { desde: consulta.desde })
      .andWhere('r.fecha_inicio < :hasta', { hasta: consulta.hasta })
      .groupBy('r.estado')
      .addGroupBy('p.id')
      .addGroupBy('p.apellido')
      .addGroupBy('p.nombre')
      .addGroupBy('e.id')
      .addGroupBy('e.nombre');

    if (consulta.alcanceProfesionalId) {
      consultaBuilder.andWhere('r.profesional_id = :alcance', { alcance: consulta.alcanceProfesionalId });
    }
    if (consulta.estado) {
      consultaBuilder.andWhere('r.estado = :estado', { estado: consulta.estado });
    }
    if (consulta.profesionalId) {
      consultaBuilder.andWhere('r.profesional_id = :profesionalId', { profesionalId: consulta.profesionalId });
    }
    if (consulta.especialidadId) {
      consultaBuilder.andWhere('r.especialidad_id = :especialidadId', {
        especialidadId: consulta.especialidadId,
      });
    }

    const filas = (await consultaBuilder.getRawMany()) as unknown as FilaAgregadoCruda[];
    return filas.map((fila) => ({
      estado: fila.estado,
      profesionalId: fila.profesionalId,
      profesionalApellido: fila.profesionalApellido,
      profesionalNombre: fila.profesionalNombre,
      especialidadId: fila.especialidadId,
      especialidadNombre: fila.especialidadNombre,
      cantidad: Number(fila.cantidad),
    }));
  }

  async listarEspecialidadesDeProfesional(profesionalId: string): Promise<EspecialidadProfesionalReporte[]> {
    const filas = (await this.reservas
      .createQueryBuilder('r')
      .innerJoin(EspecialidadOrmEntidad, 'e', 'e.id = r.especialidad_id')
      .select('e.id', 'especialidadId')
      .addSelect('e.nombre', 'nombre')
      .distinct(true)
      .where('r.profesional_id = :profesionalId', { profesionalId })
      .orderBy('e.nombre', 'ASC')
      .getRawMany()) as unknown as Array<{ especialidadId: string; nombre: string | null }>;

    return filas
      .filter((fila) => fila.nombre)
      .map((fila) => ({ id: fila.especialidadId, nombre: fila.nombre as string }));
  }
}