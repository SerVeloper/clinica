import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { crearRespuestaPaginada, normalizarPaginacion, RespuestaPaginada } from '../../../../../compartido/aplicacion/paginacion';
import { ListarPacientesDto } from '../../../aplicacion/dtos/listar-pacientes.dto';
import { Paciente } from '../../../dominio/entidades/paciente';
import { RepositorioPacientes } from '../../../dominio/repositorios/repositorio-pacientes';
import { PacienteOrmEntidad } from './paciente.orm-entidad';

@Injectable()
export class RepositorioPacientesTypeOrm implements RepositorioPacientes {
  constructor(@InjectRepository(PacienteOrmEntidad) private readonly repo: Repository<PacienteOrmEntidad>) {}

  async guardar(datos: Omit<Paciente, 'id' | 'creadoEn' | 'actualizadoEn'>): Promise<Paciente> {
    return this.aDominio(await this.repo.save(this.repo.create(datos)));
  }

  async actualizar(id: string, datos: Pick<Paciente, 'nombre' | 'apellido' | 'telefono' | 'email'>): Promise<Paciente> {
    await this.repo.update(id, datos);
    const paciente = await this.repo.findOneOrFail({ where: { id } });
    return this.aDominio(paciente);
  }

  async cambiarEstado(id: string, activo: boolean): Promise<Paciente> {
    await this.repo.update(id, { activo });
    const paciente = await this.repo.findOneOrFail({ where: { id } });
    return this.aDominio(paciente);
  }

  async listar(filtros: ListarPacientesDto = {}): Promise<RespuestaPaginada<Paciente>> {
    const { pagina, limite, saltear } = normalizarPaginacion(filtros);
    const query = this.repo.createQueryBuilder('paciente').orderBy('paciente.apellido', 'ASC').addOrderBy('paciente.nombre', 'ASC');
    const buscar = filtros.buscar?.trim().toLowerCase();

    if (buscar) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(paciente.nombre) LIKE :buscar', { buscar: `%${buscar}%` })
            .orWhere('LOWER(paciente.apellido) LIKE :buscar', { buscar: `%${buscar}%` })
            .orWhere('LOWER(paciente.telefono) LIKE :buscar', { buscar: `%${buscar}%` })
            .orWhere('LOWER(paciente.email) LIKE :buscar', { buscar: `%${buscar}%` });
        }),
      );
    }

    if (filtros.activo === 'true' || filtros.activo === 'false') query.andWhere('paciente.activo = :activo', { activo: filtros.activo === 'true' });

    const [pacientes, total] = await query.skip(saltear).take(limite).getManyAndCount();
    return crearRespuestaPaginada(
      pacientes.map((paciente) => this.aDominio(paciente)),
      total,
      pagina,
      limite,
    );
  }

  async buscarPorId(id: string): Promise<Paciente | null> {
    const paciente = await this.repo.findOne({ where: { id } });
    return paciente ? this.aDominio(paciente) : null;
  }

  private aDominio(p: PacienteOrmEntidad): Paciente {
    return new Paciente(p.id, p.nombre, p.apellido, p.telefono, p.email, p.activo, p.creadoEn, p.actualizadoEn);
  }
}
