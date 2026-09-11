import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, LessThan, MoreThan, Repository } from 'typeorm';
import { EstadoReserva } from '../../../dominio/entidades/estado-reserva';
import { Reserva } from '../../../dominio/entidades/reserva';
import { DatosCrearReserva, FiltrosReservas, RepositorioReservas } from '../../../dominio/repositorios/repositorio-reservas';
import { ReservaOrmEntidad } from './reserva.orm-entidad';

@Injectable()
export class RepositorioReservasTypeOrm implements RepositorioReservas {
  constructor(@InjectRepository(ReservaOrmEntidad) private readonly repo: Repository<ReservaOrmEntidad>) {}

  async guardar(datos: DatosCrearReserva): Promise<Reserva> {
    return this.aDominio(await this.repo.save(this.repo.create(datos)));
  }

  async actualizar(reserva: Reserva): Promise<Reserva> {
    await this.repo.update(reserva.id, {
      estado: reserva.estado,
      canceladoEn: reserva.canceladoEn,
    });

    const actualizada = await this.buscarPorId(reserva.id);
    if (!actualizada) throw new Error('Reserva no encontrada luego de actualizar');
    return actualizada;
  }

  async listar(filtros: FiltrosReservas): Promise<Reserva[]> {
    const where: Record<string, unknown> = {};

    if (filtros.profesionalId) where.profesionalId = filtros.profesionalId;
    if (filtros.pacienteId) where.pacienteId = filtros.pacienteId;
    if (filtros.especialidadId) where.especialidadId = filtros.especialidadId;
    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.fecha) {
      const inicioDia = new Date(`${filtros.fecha}T00:00:00.000Z`);
      const finDia = new Date(`${filtros.fecha}T23:59:59.999Z`);
      where.fechaInicio = Between(inicioDia, finDia);
    }

    const reservas = await this.repo.find({ where, order: { fechaInicio: 'ASC' } });
    return reservas.map((reserva) => this.aDominio(reserva));
  }

  async buscarPorId(id: string): Promise<Reserva | null> {
    const reserva = await this.repo.findOne({ where: { id } });
    return reserva ? this.aDominio(reserva) : null;
  }

  async buscarConfirmadasSolapadas(profesionalId: string, fechaInicio: Date, fechaFin: Date): Promise<Reserva[]> {
    const reservas = await this.repo.find({
      where: {
        profesionalId,
        estado: In([EstadoReserva.CONFIRMADA, EstadoReserva.ATENDIDA]),
        fechaInicio: LessThan(fechaFin),
        fechaFin: MoreThan(fechaInicio),
      },
    });

    return reservas.map((reserva) => this.aDominio(reserva));
  }

  private aDominio(r: ReservaOrmEntidad): Reserva {
    return new Reserva(
      r.id,
      r.pacienteId,
      r.profesionalId,
      r.especialidadId,
      r.fechaInicio,
      r.fechaFin,
      r.estado,
      r.creadoPorUsuarioId ?? null,
      r.creadoEn,
      r.actualizadoEn,
      r.canceladoEn,
    );
  }
}
