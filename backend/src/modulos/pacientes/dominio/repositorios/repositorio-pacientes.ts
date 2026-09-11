import { RespuestaPaginada } from '../../../../compartido/aplicacion/paginacion';
import { ListarPacientesDto } from '../../aplicacion/dtos/listar-pacientes.dto';
import { Paciente } from '../entidades/paciente';

export const REPOSITORIO_PACIENTES = Symbol('REPOSITORIO_PACIENTES');

export interface RepositorioPacientes {
  guardar(datos: Omit<Paciente, 'id' | 'creadoEn' | 'actualizadoEn'>): Promise<Paciente>;
  actualizar(id: string, datos: Pick<Paciente, 'nombre' | 'apellido' | 'telefono' | 'email'>): Promise<Paciente>;
  cambiarEstado(id: string, activo: boolean): Promise<Paciente>;
  listar(filtros?: ListarPacientesDto): Promise<RespuestaPaginada<Paciente>>;
  buscarPorId(id: string): Promise<Paciente | null>;
}
