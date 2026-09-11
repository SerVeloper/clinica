import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { REPOSITORIO_ESPECIALIDADES, RepositorioEspecialidades } from '../../dominio/repositorios/repositorio-especialidades';

@Injectable()
export class SembrarEspecialidadesServicio implements OnModuleInit {
  constructor(@Inject(REPOSITORIO_ESPECIALIDADES) private readonly repositorio: RepositorioEspecialidades) {}

  async onModuleInit() {
    await this.asegurarEspecialidad('Medicina', 15);
    await this.asegurarEspecialidad('Odontología', 30);
  }

  private async asegurarEspecialidad(nombre: string, duracionMinutos: number) {
    const existente = await this.repositorio.buscarPorNombre(nombre);
    if (!existente) {
      await this.repositorio.guardar({ nombre, duracionMinutos, activo: true });
    }
  }
}
