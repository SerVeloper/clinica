export type VistaActiva = 'agenda' | 'pacientes' | 'profesionales' | 'especialidades' | 'operaciones'

export interface VistaNavegacion {
  id: VistaActiva
  etiqueta: string
  descripcion: string
  icono: 'calendar' | 'users' | 'briefcase' | 'clipboard' | 'activity'
}
