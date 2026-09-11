import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ErrorNegocio } from '../../../../compartido/dominio/error-negocio';
import { REPOSITORIO_PROFESIONALES, RepositorioProfesionales } from '../../../profesionales/dominio/repositorios/repositorio-profesionales';
import { Usuario } from '../../dominio/entidades/usuario';
import { REPOSITORIO_USUARIOS, RepositorioUsuarios } from '../../dominio/repositorios/repositorio-usuarios';
import { CrearUsuarioDto } from '../dtos/crear-usuario.dto';
import { PasswordServicio } from './password.servicio';

export type UsuarioRespuesta = Omit<Usuario, 'passwordHash'>;

@Injectable()
export class UsuariosServicio implements OnApplicationBootstrap {
  constructor(
    @Inject(REPOSITORIO_USUARIOS) private readonly usuarios: RepositorioUsuarios,
    @Inject(REPOSITORIO_PROFESIONALES) private readonly profesionales: RepositorioProfesionales,
    private readonly passwords: PasswordServicio,
  ) {}

  async onApplicationBootstrap() {
    const admin = await this.usuarios.buscarPorUsuario('admin');
    if (admin) return;

    await this.usuarios.guardar({
      nombre: 'Admin',
      apellido: 'Local',
      usuario: 'admin',
      passwordHash: await this.passwords.hashear('admin'),
      rol: 'ADMIN',
      profesionalId: null,
      activo: true,
    });
  }

  async listar(): Promise<UsuarioRespuesta[]> {
    const usuarios = await this.usuarios.listar();
    return usuarios.map((usuario) => this.sinPassword(usuario));
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    return this.usuarios.buscarPorId(id);
  }

  async buscarPorUsuario(usuario: string): Promise<Usuario | null> {
    return this.usuarios.buscarPorUsuario(usuario);
  }

  async crear(dto: CrearUsuarioDto): Promise<UsuarioRespuesta> {
    const usuario = dto.usuario.trim();
    const existente = await this.usuarios.buscarPorUsuario(usuario);
    if (existente) throw new ErrorNegocio('Ya existe un usuario con ese nombre de usuario');

    const profesionalId = dto.profesionalId || null;
    if (dto.rol === 'ESPECIALISTA' && !profesionalId) throw new ErrorNegocio('El especialista debe estar vinculado a un profesional');
    if (dto.rol === 'ADMIN' && profesionalId) throw new ErrorNegocio('Un administrador no debe estar vinculado a un profesional');

    if (profesionalId) {
      const profesional = await this.profesionales.buscarPorId(profesionalId);
      if (!profesional) throw new ErrorNegocio('Profesional no encontrado');
    }

    return this.sinPassword(
      await this.usuarios.guardar({
        nombre: dto.nombre.trim(),
        apellido: dto.apellido.trim(),
        usuario,
        passwordHash: await this.passwords.hashear(dto.password),
        rol: dto.rol,
        profesionalId,
        activo: dto.activo ?? true,
      }),
    );
  }

  sinPassword(usuario: Usuario): UsuarioRespuesta {
    const { passwordHash: _passwordHash, ...respuesta } = usuario;
    return respuesta;
  }
}
