import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { crearRespuestaPaginada, normalizarPaginacion, RespuestaPaginada } from '../../../../../compartido/aplicacion/paginacion';
import { ListarEspecialidadesDto } from '../../../aplicacion/dtos/listar-especialidades.dto';
import { Especialidad } from '../../../dominio/entidades/especialidad';
import { RepositorioEspecialidades } from '../../../dominio/repositorios/repositorio-especialidades';
import { EspecialidadOrmEntidad } from './especialidad.orm-entidad';

@Injectable()
export class RepositorioEspecialidadesTypeOrm implements RepositorioEspecialidades {
  constructor(@InjectRepository(EspecialidadOrmEntidad) private readonly repo: Repository<EspecialidadOrmEntidad>) {}

  async guardar(datos: Omit<Especialidad, 'id' | 'creadoEn' | 'actualizadoEn'>): Promise<Especialidad> {
    return this.aDominio(await this.repo.save(this.repo.create(datos)));
  }

  async actualizar(id: string, datos: Pick<Especialidad, 'nombre' | 'duracionMinutos'>): Promise<Especialidad> {
    await this.repo.update(id, datos);
    const especialidad = await this.repo.findOneOrFail({ where: { id } });
    return this.aDominio(especialidad);
  }

  async cambiarEstado(id: string, activo: boolean): Promise<Especialidad> {
    await this.repo.update(id, { activo });
    const especialidad = await this.repo.findOneOrFail({ where: { id } });
    return this.aDominio(especialidad);
  }

  async listar(filtros: ListarEspecialidadesDto = {}): Promise<RespuestaPaginada<Especialidad>> {
    const { pagina, limite, saltear } = normalizarPaginacion(filtros);
    const query = this.repo.createQueryBuilder('especialidad').orderBy('especialidad.nombre', 'ASC');
    const buscar = filtros.buscar?.trim().toLowerCase();

    if (buscar) query.andWhere('LOWER(especialidad.nombre) LIKE :buscar', { buscar: `%${buscar}%` });
    if (filtros.activo === 'true' || filtros.activo === 'false') query.andWhere('especialidad.activo = :activo', { activo: filtros.activo === 'true' });

    const [especialidades, total] = await query.skip(saltear).take(limite).getManyAndCount();
    return crearRespuestaPaginada(
      especialidades.map((especialidad) => this.aDominio(especialidad)),
      total,
      pagina,
      limite,
    );
  }

  async buscarPorId(id: string): Promise<Especialidad | null> {
    const especialidad = await this.repo.findOne({ where: { id } });
    return especialidad ? this.aDominio(especialidad) : null;
  }

  async buscarPorNombre(nombre: string): Promise<Especialidad | null> {
    const especialidad = await this.repo.findOne({ where: { nombre } });
    return especialidad ? this.aDominio(especialidad) : null;
  }

  private aDominio(e: EspecialidadOrmEntidad): Especialidad {
    return new Especialidad(e.id, e.nombre, e.duracionMinutos, e.activo, e.creadoEn, e.actualizadoEn);
  }
}
