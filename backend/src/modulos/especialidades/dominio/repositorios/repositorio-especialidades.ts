import { RespuestaPaginada } from '../../../../compartido/aplicacion/paginacion';
import { ListarEspecialidadesDto } from '../../aplicacion/dtos/listar-especialidades.dto';
import { Especialidad } from '../entidades/especialidad';

export const REPOSITORIO_ESPECIALIDADES = Symbol('REPOSITORIO_ESPECIALIDADES');

export interface RepositorioEspecialidades {
  guardar(especialidad: Omit<Especialidad, 'id' | 'creadoEn' | 'actualizadoEn'>): Promise<Especialidad>;
  actualizar(id: string, datos: Pick<Especialidad, 'nombre' | 'duracionMinutos'>): Promise<Especialidad>;
  cambiarEstado(id: string, activo: boolean): Promise<Especialidad>;
  listar(filtros?: ListarEspecialidadesDto): Promise<RespuestaPaginada<Especialidad>>;
  buscarPorId(id: string): Promise<Especialidad | null>;
  buscarPorNombre(nombre: string): Promise<Especialidad | null>;
}
