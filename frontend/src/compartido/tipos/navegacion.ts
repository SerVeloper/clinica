import type { NombreIcono } from '../iconos/iconos'

export type VistaActiva =
  | 'agenda'
  | 'pacientes'
  | 'profesionales'
  | 'especialidades'
  | 'configuraciones'
  | 'configuraciones-usuarios'
  | 'configuraciones-clinica'
  | 'configuraciones-horarios'

export interface SubVistaNavegacion {
  id: VistaActiva
  etiqueta: string
  icono: NombreIcono
}

export interface VistaNavegacion {
  id: VistaActiva
  etiqueta: string
  descripcion: string
  icono: 'calendar' | 'users' | 'briefcase' | 'clipboard' | 'ajustes'
  hijos?: SubVistaNavegacion[]
}
