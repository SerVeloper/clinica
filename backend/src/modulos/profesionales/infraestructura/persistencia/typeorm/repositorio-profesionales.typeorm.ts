import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { crearRespuestaPaginada, normalizarPaginacion, RespuestaPaginada } from '../../../../../compartido/aplicacion/paginacion';
import { ListarProfesionalesDto } from '../../../aplicacion/dtos/listar-profesionales.dto';
import { Profesional } from '../../../dominio/entidades/profesional';
import { RepositorioProfesionales } from '../../../dominio/repositorios/repositorio-profesionales';
import { ProfesionalOrmEntidad } from './profesional.orm-entidad';

@Injectable()
export class RepositorioProfesionalesTypeOrm implements RepositorioProfesionales {
  constructor(@InjectRepository(ProfesionalOrmEntidad) private readonly repo: Repository<ProfesionalOrmEntidad>) {}

  async guardar(datos: Omit<Profesional, 'id' | 'creadoEn' | 'actualizadoEn'>): Promise<Profesional> {
    return this.aDominio(await this.repo.save(this.repo.create(datos)));
  }

  async actualizar(id: string, datos: Pick<Profesional, 'nombre' | 'apellido' | 'telefono' | 'especialidadId'>): Promise<Profesional> {
    await this.repo.update(id, datos);
    const profesional = await this.repo.findOneOrFail({ where: { id } });
    return this.aDominio(profesional);
  }

  async cambiarEstado(id: string, activo: boolean): Promise<Profesional> {
    await this.repo.update(id, { activo });
    const profesional = await this.repo.findOneOrFail({ where: { id } });
    return this.aDominio(profesional);
  }

  async listar(filtros: ListarProfesionalesDto = {}): Promise<RespuestaPaginada<Profesional>> {
    const { pagina, limite, saltear } = normalizarPaginacion(filtros);
    const query = this.repo.createQueryBuilder('profesional').orderBy('profesional.apellido', 'ASC').addOrderBy('profesional.nombre', 'ASC');
    const buscar = filtros.buscar?.trim().toLowerCase();

    if (buscar) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(profesional.nombre) LIKE :buscar', { buscar: `%${buscar}%` })
            .orWhere('LOWER(profesional.apellido) LIKE :buscar', { buscar: `%${buscar}%` })
            .orWhere('LOWER(profesional.telefono) LIKE :buscar', { buscar: `%${buscar}%` });
        }),
      );
    }

    if (filtros.especialidadId) query.andWhere('profesional.especialidadId = :especialidadId', { especialidadId: filtros.especialidadId });
    if (filtros.activo === 'true' || filtros.activo === 'false') query.andWhere('profesional.activo = :activo', { activo: filtros.activo === 'true' });

    const [profesionales, total] = await query.skip(saltear).take(limite).getManyAndCount();
    return crearRespuestaPaginada(
      profesionales.map((profesional) => this.aDominio(profesional)),
      total,
      pagina,
      limite,
    );
  }

  async buscarPorId(id: string): Promise<Profesional | null> {
    const profesional = await this.repo.findOne({ where: { id } });
    return profesional ? this.aDominio(profesional) : null;
  }

  private aDominio(p: ProfesionalOrmEntidad): Profesional {
    return new Profesional(p.id, p.nombre, p.apellido, p.telefono, p.especialidadId, p.activo, p.creadoEn, p.actualizadoEn);
  }
}
