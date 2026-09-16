import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Sesion } from '../../../dominio/entidades/sesion';
import { DatosCrearSesion, RepositorioSesiones } from '../../../dominio/repositorios/repositorio-sesiones';
import { SesionOrmEntidad } from './sesion.orm-entidad';

@Injectable()
export class RepositorioSesionesTypeOrm implements RepositorioSesiones {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async guardar(datos: DatosCrearSesion): Promise<Sesion> {
    const repo = this.dataSource.getRepository(SesionOrmEntidad);
    return this.aDominio(await repo.save(repo.create(datos)));
  }

  async buscarActivaPorHash(tokenHash: string): Promise<Sesion | null> {
    const sesion = await this.dataSource.getRepository(SesionOrmEntidad).findOne({
      where: { tokenHash, revocado: false },
    });
    return sesion ? this.aDominio(sesion) : null;
  }

  async rotarAtómicamente(
    tokenHash: string,
    nuevoTokenHash: string,
    nuevaExpiracion: Date,
  ): Promise<{ sesion: Sesion } | null> {
    const sesion = await this.dataSource.transaction(async (manager) => {
      const activa = await manager.findOne(SesionOrmEntidad, {
        where: { tokenHash, revocado: false },
        lock: { mode: 'pessimistic_write' },
      });

      if (!activa || activa.revocado || activa.expiraEn.getTime() <= Date.now()) return null;

      await manager.update(SesionOrmEntidad, activa.id, { revocado: true });

      return manager.save(
        manager.create(SesionOrmEntidad, {
          usuarioId: activa.usuarioId,
          tokenHash: nuevoTokenHash,
          expiraEn: nuevaExpiracion,
          revocado: false,
        }),
      );
    });

    return sesion ? { sesion: this.aDominio(sesion) } : null;
  }

  async revocarPorHash(tokenHash: string): Promise<void> {
    await this.dataSource.getRepository(SesionOrmEntidad).update(
      { tokenHash, revocado: false },
      { revocado: true },
    );
  }

  private aDominio(s: SesionOrmEntidad): Sesion {
    return new Sesion(s.id, s.usuarioId, s.tokenHash, s.expiraEn, s.revocado, s.creadoEn);
  }
}