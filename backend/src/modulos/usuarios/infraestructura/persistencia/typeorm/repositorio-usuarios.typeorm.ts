import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { esRolUsuario } from '../../../dominio/entidades/rol-usuario';
import { Usuario } from '../../../dominio/entidades/usuario';
import { DatosCrearUsuario, RepositorioUsuarios } from '../../../dominio/repositorios/repositorio-usuarios';
import { UsuarioOrmEntidad } from './usuario.orm-entidad';

@Injectable()
export class RepositorioUsuariosTypeOrm implements RepositorioUsuarios {
  constructor(@InjectRepository(UsuarioOrmEntidad) private readonly repo: Repository<UsuarioOrmEntidad>) {}

  async guardar(datos: DatosCrearUsuario): Promise<Usuario> {
    return this.aDominio(await this.repo.save(this.repo.create(datos)));
  }

  async listar(): Promise<Usuario[]> {
    const usuarios = await this.repo.find({ order: { apellido: 'ASC', nombre: 'ASC' } });
    return usuarios.map((usuario) => this.aDominio(usuario));
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    const usuario = await this.repo.findOne({ where: { id } });
    return usuario ? this.aDominio(usuario) : null;
  }

  async buscarPorUsuario(usuario: string): Promise<Usuario | null> {
    const encontrado = await this.repo.findOne({ where: { usuario } });
    return encontrado ? this.aDominio(encontrado) : null;
  }

  private aDominio(u: UsuarioOrmEntidad): Usuario {
    if (!esRolUsuario(u.rol)) throw new Error(`Rol de usuario no válido: ${u.rol}`);

    return new Usuario(u.id, u.nombre, u.apellido, u.usuario, u.passwordHash, u.rol, u.profesionalId, u.activo, u.creadoEn, u.actualizadoEn);
  }
}
