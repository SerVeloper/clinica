import { RespuestaPaginada } from '../../../../compartido/aplicacion/paginacion';
import { ListarProfesionalesDto } from '../../aplicacion/dtos/listar-profesionales.dto';
import { Profesional } from '../entidades/profesional';

export const REPOSITORIO_PROFESIONALES = Symbol('REPOSITORIO_PROFESIONALES');

export interface RepositorioProfesionales {
  guardar(datos: Omit<Profesional, 'id' | 'creadoEn' | 'actualizadoEn'>): Promise<Profesional>;
  actualizar(id: string, datos: Pick<Profesional, 'nombre' | 'apellido' | 'telefono' | 'especialidadId'>): Promise<Profesional>;
  cambiarEstado(id: string, activo: boolean): Promise<Profesional>;
  listar(filtros?: ListarProfesionalesDto): Promise<RespuestaPaginada<Profesional>>;
  buscarPorId(id: string): Promise<Profesional | null>;
}
